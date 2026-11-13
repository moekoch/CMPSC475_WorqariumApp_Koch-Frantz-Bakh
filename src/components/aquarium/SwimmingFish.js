import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, useWindowDimensions } from 'react-native';
import FishSprite from './FishSprite';

const EMPTY = [];
const CHASE_MULTIPLIER = 2.5; // how much faster fish swim toward food
const WANDER_EASING = Easing.inOut(Easing.sin);
const CHASE_EASING = Easing.out(Easing.quad);

const rand = (min, max) => min + Math.random() * (max - min);
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Where the fish is right now, computed from the current leg (cheap, no native reads)
const getPos = (l) => {
  const t = clamp((Date.now() - l.t0) / l.duration, 0, 1);
  const e = l.easing(t);
  return { x: l.sx + (l.tx - l.sx) * e, y: l.sy + (l.ty - l.sy) * e };
};

export default function SwimmingFish({
  fishKey,
  width,
  speed = 40,
  facesRight = true,
  opacity = 1,      // new: far fish are faded
  elevation = 0,    // new: lifts close fish above the card on Android
  foods = EMPTY,
  onEat,
  topInset = 40,
  bottomInset = 100,
}) {
  const { width: W, height: H } = useWindowDimensions();
  const fishH = width * 0.6;

  const bounds = useRef({});
  bounds.current = {
    minX: -width * 0.2,
    maxX: W - width * 0.8,
    minY: topInset,
    maxY: Math.max(topInset + 1, H - bottomInset - fishH),
  };

  const foodsRef = useRef(foods);
  foodsRef.current = foods;
  const onEatRef = useRef(onEat);
  onEatRef.current = onEat;

  const fish = useRef(null);
  if (!fish.current) {
    const b = bounds.current;
    const sx = rand(b.minX, b.maxX);
    const sy = rand(b.minY, b.maxY);
    fish.current = {
      x: new Animated.Value(sx),
      y: new Animated.Value(sy),
      tilt: new Animated.Value(0),
      bob: new Animated.Value(0),
      leg: { sx, sy, tx: sx, ty: sy, t0: 0, duration: 1, easing: Easing.linear },
      anim: null,
      targetId: null,
      facingRight: true,
      retarget: null,
    };
  }
  const f = fish.current;

  const [facingRight, setFacingRight] = useState(true);

  // Swim controller: wander randomly, or chase food when there is some
  useEffect(() => {
    let alive = true;

    const startLeg = (tx, ty, spd, easing, onDone) => {
      f.anim?.stop();
      const cur = getPos(f.leg);
      f.x.setValue(cur.x);
      f.y.setValue(cur.y);

      const dx = tx - cur.x;
      const dy = ty - cur.y;
      const len = Math.hypot(dx, dy);
      const duration = Math.max(250, (len / spd) * 1000);
      const goingRight = Math.abs(dx) < 4 ? f.facingRight : dx >= 0;
      const tilt = clamp(Math.atan2(dy, Math.max(Math.abs(dx), 1)), -0.45, 0.45);

      f.facingRight = goingRight;
      setFacingRight(goingRight);
      f.leg = { sx: cur.x, sy: cur.y, tx, ty, t0: Date.now(), duration, easing };

      f.anim = Animated.parallel([
        Animated.timing(f.x, { toValue: tx, duration, easing, useNativeDriver: true }),
        Animated.timing(f.y, { toValue: ty, duration, easing, useNativeDriver: true }),
        Animated.timing(f.tilt, {
          toValue: goingRight ? tilt : -tilt,
          duration: 400,
          useNativeDriver: true,
        }),
      ]);
      f.anim.start(({ finished }) => {
        if (finished && alive) onDone();
      });
    };

    const wander = () => {
      if (!alive) return;
      f.targetId = null;
      const { minX, maxX, minY, maxY } = bounds.current;
      const p = getPos(f.leg);

      const heading = rand(0, Math.PI * 2);
      const dist = rand(120, 280);
      let tx = clamp(p.x + Math.cos(heading) * dist, minX, maxX);
      let ty = clamp(p.y + Math.sin(heading) * dist * 0.5, minY, maxY);
      if (Math.hypot(tx - p.x, ty - p.y) < 40) {
        tx = rand(minX, maxX);
        ty = rand(minY, maxY);
      }
      startLeg(tx, ty, speed, WANDER_EASING, wander);
    };

    const nearestFood = () => {
      const p = getPos(f.leg);
      let best = null;
      let bestD = Infinity;
      for (const fd of foodsRef.current) {
        const d = Math.hypot(fd.x - width / 2 - p.x, fd.y - fishH / 2 - p.y);
        if (d < bestD) {
          bestD = d;
          best = fd;
        }
      }
      return best;
    };

    const next = () => {
      const fd = nearestFood();
      if (fd) chase(fd);
      else wander();
    };

    const chase = (food) => {
      f.targetId = food.id;
      // Aim so the fish's middle ends up on the pellet
      startLeg(food.x - width / 2, food.y - fishH / 2, speed * CHASE_MULTIPLIER, CHASE_EASING, () => {
        if (foodsRef.current.some((fd) => fd.id === food.id)) onEatRef.current?.(food.id);
        next();
      });
    };

    // Called whenever the food list changes
    f.retarget = () => {
      if (!alive) return;
      const list = foodsRef.current;
      if (f.targetId != null) {
        if (list.some((fd) => fd.id === f.targetId)) return; // keep chasing
        next(); // someone else ate my food
      } else if (list.length) {
        next(); // new food while wandering
      }
    };

    wander();
    return () => {
      alive = false;
      f.anim?.stop();
      f.retarget = null;
    };
  }, [f, speed, width, fishH]);

  useEffect(() => {
    f.retarget?.();
  }, [foods, f]);

  // Gentle body wiggle
  useEffect(() => {
    const d = rand(700, 1200);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(f.bob, { toValue: 1, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(f.bob, { toValue: 0, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [f]);

  const rotate = f.tilt.interpolate({ inputRange: [-1, 1], outputRange: ['-1rad', '1rad'] });
  const bobY = f.bob.interpolate({ inputRange: [0, 1], outputRange: [-3, 3] });
  const flip = facingRight !== facesRight;

  return (
  <Animated.View
    pointerEvents="none"
    style={{
        position: 'absolute',
        top: 0,
        left: 0,
        opacity,
        zIndex: elevation,
        elevation,
        transform: [
        { translateX: f.x },
        { translateY: f.y },
        { rotate },
        { scaleX: flip ? -1 : 1 },
        ],
    }}
    >
      <Animated.View style={{ transform: [{ translateY: bobY }] }}>
        <FishSprite fishKey={fishKey} width={width} style={{ position: 'relative' }} />
      </Animated.View>
    </Animated.View>
  );
}