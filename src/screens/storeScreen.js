import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, } from 'react-native';
import FishSprite from '../components/aquarium/FishSprite';
import ItemSprite from '../components/aquarium/ItemSprite';
import WaterBackground from '../components/aquarium/WaterBackground';
import WorqariumNav from '../components/aquarium/WorqariumNav';
import { FISH_KEYS } from '../constants/fishAssets';
import { ITEM_KEYS } from '../constants/itemAssets';
import { COLORS, FONTS } from '../constants/theme';
import { api } from '../lib/api';

// fish shown if server sends key app doesn't have image for
const DEFAULT_FISH_KEY = 'blueTang';

// fish image to draw for imageKey from server
const fishKeyFor = (imageKey) =>
  FISH_KEYS.includes(imageKey) ? imageKey : (FISH_KEYS[0] ?? null);

// item image to draw for imageKey from server
const itemKeyFor = (imageKey) =>
  ITEM_KEYS.includes(imageKey) ? imageKey : (ITEM_KEYS[0] ?? null);

// fish picture in box the size of fish
function FishImage({ imageKey, width }) {
  return (
    <View style={{ width, height: width * 0.62 }}>
      <FishSprite fishKey={fishKeyFor(imageKey)} width={width} style={{ top: 0, left: 0 }} />
    </View>
  );
}

// item picture in box the size of fish
function ItemImage({ imageKey, width }) {
  return (
    <View style={{ width, height: width * 0.62 }}>
      <ItemSprite itemKey={itemKeyFor(imageKey)} width={width} />
    </View>
  );
}

// picture of a fish or an item
function ThingImage({ kind, imageKey, width }) {
  return kind === 'item'
    ? <ItemImage imageKey={imageKey} width={width} />
    : <FishImage imageKey={imageKey} width={width} />;
}

// button used in preview card and popup
function Button({ label, onPress, variant = 'primary', busy = false, disabled = false, grow = false }) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      style={[
        styles.btn,
        isPrimary ? styles.btnPrimary : styles.btnSecondary,
        grow && styles.btnGrow,
        (busy || disabled) && styles.btnDim,
      ]}
      onPress={onPress}
      disabled={busy || disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: busy || disabled }}
    >
      {busy ? (
        <ActivityIndicator color={isPrimary ? COLORS.pearl : COLORS.ink} />
      ) : (
        <Text style={isPrimary ? styles.btnTextLight : styles.btnTextDark}>{label}</Text>
      )}
    </Pressable>
  );
}

// popup covers screen
function Popup({ visible, onClose, children }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.popup}>{children}</View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function StoreScreen({ navigation }) {
  // fish for sale from server
  const [avatars, setAvatars] = useState([]);

  // items for sale from server
  const [items, setItems] = useState([]);

  // user's points, owned fish and items, worn fish
  const [wallet, setWallet] = useState({
    points: 0,
    ownedAvatarIds: [],
    ownedItemIds: [],
    avatarId: null,
  });

  // false until store data has loaded
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');

  // what is picked in the grids
  const [selection, setSelection] = useState(null);

  // buy popup, waiting on server, messages for user
  const [popupOpen, setPopupOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [message, setMessage] = useState('');

  // load fish, items, and user's points when screen opens
  useEffect(() => {
    Promise.all([api('/api/avatars'), api('/api/items'), api('/api/users/me')])
      .then(([fish, decorations, me]) => {
        setAvatars(fish);
        setItems(decorations);
        setWallet({
          points: me.points,
          ownedAvatarIds: me.ownedAvatarIds,
          ownedItemIds: me.ownedItemIds ?? [],
          avatarId: me.avatarId,
        });
        setLoaded(true);
      })
      .catch((error) => {
        // send to login if not logged in
        if (error.status === 401) navigation?.replace?.('login');
        else setLoadError('Could not load the store.');
      });
  }, [navigation]);

  // worn fish
  const equipped =
    avatars.find((a) => a._id === wallet.avatarId) ??
    avatars.find((a) => a.imageKey === DEFAULT_FISH_KEY);

  // kind of thing picked and the thing itself
  const kind = selection?.kind;
  const selected = selection
    ? (kind === 'item' ? items : avatars).find((thing) => thing._id === selection.id)
    : undefined;

  // free things belong to everyone
  const isOwned = (thing, thingKind) => {
    const ownedIds = thingKind === 'item' ? wallet.ownedItemIds : wallet.ownedAvatarIds;
    return thing.price === 0 || ownedIds.includes(thing._id);
  };

  // only fish can be worn
  const isEquipped = (avatar) => avatar._id === equipped?._id;

  // is this exact tile picked
  const isPicked = (thingKind, id) => selection?.kind === thingKind && selection?.id === id;

  // preview shows picked fish or item, or user's current fish
  const shown = selected ?? equipped;
  const shownKind = selected ? kind : 'avatar';

  // text under each tile
  const tileLabel = (thing, thingKind) => {
    if (thingKind === 'avatar' && isEquipped(thing)) return 'In use';
    if (isOwned(thing, thingKind)) return thing.price === 0 ? 'Free' : 'Owned';
    return `${thing.price} pts`;
  };

  // can user pay for picked thing
  const canAfford = selected ? wallet.points >= selected.price : false;

  // pick fish or item
  const handleSelect = (thingKind, thing) => {
    setSelection({ kind: thingKind, id: thing._id });
    setMessage('');
  };

  // open buy popup
  const openBuy = () => {
    setBuyError('');
    setPopupOpen(true);
  };

  // buy picked fish or item
  const handleBuy = async () => {
    setBusy(true);
    setBuyError('');
    try {
      const route = kind === 'item' ? 'items' : 'avatars';
      const updated = await api(`/api/${route}/${selected._id}/purchase`, { method: 'POST' });

      // use new balance and owned things from server
      setWallet((prev) => ({ ...prev, ...updated }));

      setPopupOpen(false);
      setMessage(`You bought ${selected.name}!`);
    } catch (error) {
      // not enough points, already owned, server down
      setBuyError(error.message);
    } finally {
      setBusy(false);
    }
  };

  // wear picked fish in sessions
  const handleEquip = async () => {
    setBusy(true);
    try {
      await api('/api/users/me/avatar', { method: 'PATCH', body: { avatarId: selected._id } });
      setWallet((prev) => ({ ...prev, avatarId: selected._id }));
      setMessage(`${selected.name} is now your fish.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  // button under preview
  let action = { label: 'Buy', disabled: true, onPress: undefined };
  if (selected) {
    if (!isOwned(selected, kind)) action = { label: 'Buy', disabled: false, onPress: openBuy };
    else if (kind === 'item') action = { label: 'Owned', disabled: true, onPress: undefined };
    else if (isEquipped(selected)) action = { label: 'In use', disabled: true, onPress: undefined };
    else action = { label: 'Use', disabled: false, onPress: handleEquip };
  }

  return (
    <WaterBackground style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* title and points */}
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.title}>Store</Text>
          <View style={styles.pointsPill}>
            <Text style={styles.pointsText}>{loaded ? wallet.points : '…'} pts</Text>
          </View>
        </View>

        {/* preview of the picked fish or item */}
        <View style={styles.preview}>
          <View style={styles.previewImage}>
            {shown && <ThingImage kind={shownKind} imageKey={shown.imageKey} width={120} />}
          </View>
          {shown && <Text style={styles.previewName}>{shown.name}</Text>}
          {!!message && (
            <Text accessibilityLiveRegion="polite" style={styles.previewNote}>
              {message}
            </Text>
          )}

          {/* buy, use, owned, in use, disabled */}
          <Button
            label={action.label}
            onPress={action.onPress}
            disabled={action.disabled}
            busy={busy && !popupOpen}
          />
        </View>

        {/* fish for sale */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Avatars</Text>
          <Text style={styles.description}>Customize your avatar</Text>

          {/* status messages */}
          {!!loadError && (
            <Text accessibilityRole="alert" style={styles.error}>
              {loadError}
            </Text>
          )}
          {!loaded && !loadError && <Text style={styles.description}>Loading fish...</Text>}

          {/* one tile per fish from server */}
          <View style={styles.grid}>
            {avatars.map((avatar) => {
              const picked = isPicked('avatar', avatar._id);
              return (
                <Pressable
                  key={avatar._id}
                  style={[styles.tile, picked && styles.tileSelected]}
                  onPress={() => handleSelect('avatar', avatar)}
                  accessibilityRole="button"
                  accessibilityLabel={`${avatar.name}, ${tileLabel(avatar, 'avatar')}`}
                  accessibilityState={{ selected: picked }}
                >
                  <FishImage imageKey={avatar.imageKey} width={64} />
                  <Text style={styles.tileLabel} numberOfLines={1}>
                    {tileLabel(avatar, 'avatar')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* decorations for sale */}
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Decorations</Text>
          <Text style={styles.description}>Obtain profile decorations</Text>

          {/* status messages */}
          {!loaded && !loadError && <Text style={styles.description}>Loading decorations...</Text>}

          {/* one tile per item from server */}
          <View style={styles.grid}>
            {items.map((item) => {
              const picked = isPicked('item', item._id);
              return (
                <Pressable
                  key={item._id}
                  style={[styles.tile, picked && styles.tileSelected]}
                  onPress={() => handleSelect('item', item)}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name}, ${tileLabel(item, 'item')}`}
                  accessibilityState={{ selected: picked }}
                >
                  <ItemImage imageKey={item.imageKey} width={64} />
                  <Text style={styles.tileLabel} numberOfLines={1}>
                    {tileLabel(item, 'item')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* buy popup */}
      <Popup visible={popupOpen} onClose={() => setPopupOpen(false)}>
        {selected && (
          <>
            <Text style={styles.popupTitle}>Buy {selected.name}?</Text>
            <View style={styles.popupImage}>
              <ThingImage kind={kind} imageKey={selected.imageKey} width={110} />
            </View>

            {/* cost and balance */}
            <Text style={styles.popupText}>
              This costs {selected.price} pts. You have {wallet.points} pts
              {canAfford ? ` and will have ${wallet.points - selected.price} left.` : '.'}
            </Text>

            {/* not enough points */}
            {!canAfford && (
              <Text accessibilityRole="alert" style={styles.error}>
                You need {selected.price - wallet.points} more points.
              </Text>
            )}

            {/* error from server */}
            {!!buyError && (
              <Text accessibilityRole="alert" style={styles.error}>
                {buyError}
              </Text>
            )}

            {/* close without buying, confirm, disabled */}
            <View style={styles.popupActions}>
              <Button label="Cancel" variant="secondary" onPress={() => setPopupOpen(false)} grow />
              <Button label="Buy" onPress={handleBuy} busy={busy} disabled={!canAfford} grow />
            </View>
          </>
        )}
      </Popup>

      <WorqariumNav active="Store" navigation={navigation} />
    </WaterBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 100,
    gap: 16,
  },

  // title and points
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: {
    color: COLORS.pearl,
    fontFamily: FONTS.heading,
    fontSize: 30,
    textShadowColor: 'rgba(0,36,70,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  pointsPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.pearl,
    borderWidth: 1,
    borderColor: COLORS.glassEdge,
  },
  pointsText: { color: COLORS.ink, fontFamily: FONTS.bodyBold, fontSize: 14 },

  // preview card
  preview: {
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 24,
    backgroundColor: COLORS.pearl,
    borderColor: COLORS.glassEdge,
    borderWidth: 1,
    shadowColor: '#002446',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  previewImage: {
    width: '100%',
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.foam,
  },
  previewName: { color: COLORS.ink, fontFamily: FONTS.bodyBold, fontSize: 15 },
  previewNote: { color: COLORS.inkSoft, fontFamily: FONTS.body, fontSize: 13, textAlign: 'center' },

  // grids
  panel: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: COLORS.pearl,
    borderColor: COLORS.glassEdge,
    borderWidth: 1,
    shadowColor: '#002446',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  panelTitle: { color: COLORS.ink, fontFamily: FONTS.bodyBold, fontSize: 18 },
  description: { color: COLORS.inkSoft, fontFamily: FONTS.body, fontSize: 13, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  tile: {
    width: '31%',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: COLORS.foam,
  },
  tileSelected: { borderColor: COLORS.deepWater },
  tileLabel: { color: COLORS.inkSoft, fontFamily: FONTS.bodyBold, fontSize: 12 },

  // buttons
  btn: {
    height: 46,
    minWidth: 120,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  btnGrow: { flex: 1, minWidth: 0 },
  btnDim: { opacity: 0.5 },
  btnPrimary: { backgroundColor: COLORS.deepWater },
  btnSecondary: { borderWidth: 1.5, borderColor: COLORS.deepWater },
  btnTextLight: { color: COLORS.pearl, fontFamily: FONTS.bodyBold, fontSize: 16 },
  btnTextDark: { color: COLORS.ink, fontFamily: FONTS.bodyBold, fontSize: 16 },

  // buy popup
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  popup: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: COLORS.pearl,
    borderRadius: 24,
    padding: 24,
    gap: 12,
  },
  popupTitle: { color: COLORS.ink, fontFamily: FONTS.heading, fontSize: 22, textAlign: 'center' },
  popupImage: { alignSelf: 'center', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  popupText: { color: COLORS.inkSoft, fontFamily: FONTS.body, fontSize: 15, textAlign: 'center' },
  popupActions: { flexDirection: 'row', gap: 12, marginTop: 6 },

  // errors
  error: { color: COLORS.coralDeep, fontFamily: FONTS.body, fontSize: 13, textAlign: 'center' },
});