import { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Modal, Alert, Share, Platform,
  KeyboardAvoidingView, SectionList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ── CATEGORIE DEFAULT ──
const DEFAULT_CATEGORIES = [
  { id: "frutta",    label: "Frutta & Verdura",  icon: "🥦", color: "#4CAF50" },
  { id: "carne",     label: "Carne & Pesce",      icon: "🥩", color: "#F44336" },
  { id: "latticini", label: "Latticini & Uova",   icon: "🥛", color: "#FFC107" },
  { id: "pane",      label: "Pane & Cereali",     icon: "🍞", color: "#FF9800" },
  { id: "bevande",   label: "Bevande",            icon: "🧃", color: "#2196F3" },
  { id: "snack",     label: "Snack & Dolci",      icon: "🍫", color: "#9C27B0" },
  { id: "surgelati", label: "Surgelati",          icon: "❄️", color: "#00BCD4" },
  { id: "igiene",    label: "Igiene & Pulizia",   icon: "🧼", color: "#607D8B" },
  { id: "dispensa",  label: "Dispensa",           icon: "🫙", color: "#795548" },
  { id: "altro",     label: "Altro",              icon: "🛍️", color: "#9E9E9E" },
];

const CAT_COLORS = ["#4CAF50","#F44336","#FFC107","#FF9800","#2196F3","#9C27B0","#00BCD4","#607D8B","#795548","#E91E63","#009688","#FF5722","#3F51B5","#8BC34A","#9E9E9E"];
const CAT_ICONS  = ["🥦","🥩","🥛","🍞","🧃","🍫","❄️","🧼","🫙","🛍️","🍳","🧹","🐾","💊","🌿","🍷","☕","🧀","🥚","🍅"];
const UNITS = ["pz", "g", "kg", "L", "ml", "conf", "busta", "scatola"];

const INITIAL_DISPENSA = [
  { id: "d1",  name: "Acqua frizzante",   cat: "bevande",   defaultQty: "6",   defaultUnit: "pz" },
  { id: "d2",  name: "Acqua naturale",    cat: "bevande",   defaultQty: "6",   defaultUnit: "pz" },
  { id: "d3",  name: "Banane",            cat: "frutta",    defaultQty: "1",   defaultUnit: "kg" },
  { id: "d4",  name: "Birra",             cat: "bevande",   defaultQty: "6",   defaultUnit: "pz" },
  { id: "d5",  name: "Biscotti",          cat: "snack",     defaultQty: "1",   defaultUnit: "conf"},
  { id: "d6",  name: "Bresaola",          cat: "carne",     defaultQty: "150", defaultUnit: "g"  },
  { id: "d7",  name: "Burro",             cat: "latticini", defaultQty: "250", defaultUnit: "g"  },
  { id: "d8",  name: "Caffè",             cat: "dispensa",  defaultQty: "250", defaultUnit: "g"  },
  { id: "d9",  name: "Carote",            cat: "frutta",    defaultQty: "500", defaultUnit: "g"  },
  { id: "d10", name: "Carta igienica",    cat: "igiene",    defaultQty: "1",   defaultUnit: "conf"},
  { id: "d11", name: "Cioccolato",        cat: "snack",     defaultQty: "2",   defaultUnit: "pz" },
  { id: "d12", name: "Cipolle",           cat: "frutta",    defaultQty: "500", defaultUnit: "g"  },
  { id: "d13", name: "Cornetti",          cat: "pane",      defaultQty: "4",   defaultUnit: "pz" },
  { id: "d14", name: "Detersivo piatti",  cat: "igiene",    defaultQty: "1",   defaultUnit: "pz" },
  { id: "d15", name: "Farina 00",         cat: "pane",      defaultQty: "1",   defaultUnit: "kg" },
  { id: "d16", name: "Gelato",            cat: "snack",     defaultQty: "1",   defaultUnit: "conf"},
  { id: "d17", name: "Insalata",          cat: "frutta",    defaultQty: "1",   defaultUnit: "pz" },
  { id: "d18", name: "Latte intero",      cat: "latticini", defaultQty: "2",   defaultUnit: "L"  },
  { id: "d19", name: "Macinato misto",    cat: "carne",     defaultQty: "500", defaultUnit: "g"  },
  { id: "d20", name: "Mele",              cat: "frutta",    defaultQty: "1",   defaultUnit: "kg" },
  { id: "d21", name: "Mozzarella",        cat: "latticini", defaultQty: "2",   defaultUnit: "pz" },
  { id: "d22", name: "Olio EVO",          cat: "dispensa",  defaultQty: "1",   defaultUnit: "L"  },
  { id: "d23", name: "Pane di casa",      cat: "pane",      defaultQty: "1",   defaultUnit: "pz" },
  { id: "d24", name: "Parmigiano",        cat: "latticini", defaultQty: "200", defaultUnit: "g"  },
  { id: "d25", name: "Passata pomodoro",  cat: "dispensa",  defaultQty: "2",   defaultUnit: "pz" },
  { id: "d26", name: "Pasta",             cat: "pane",      defaultQty: "500", defaultUnit: "g"  },
  { id: "d27", name: "Patate",            cat: "frutta",    defaultQty: "1",   defaultUnit: "kg" },
  { id: "d28", name: "Patatine",          cat: "snack",     defaultQty: "1",   defaultUnit: "busta"},
  { id: "d29", name: "Petto di pollo",    cat: "carne",     defaultQty: "500", defaultUnit: "g"  },
  { id: "d30", name: "Piselli surgelati", cat: "surgelati", defaultQty: "500", defaultUnit: "g"  },
  { id: "d31", name: "Pizza surgelata",   cat: "surgelati", defaultQty: "2",   defaultUnit: "pz" },
  { id: "d32", name: "Pomodori",          cat: "frutta",    defaultQty: "500", defaultUnit: "g"  },
  { id: "d33", name: "Prosciutto cotto",  cat: "carne",     defaultQty: "200", defaultUnit: "g"  },
  { id: "d34", name: "Riso",              cat: "pane",      defaultQty: "500", defaultUnit: "g"  },
  { id: "d35", name: "Sale",              cat: "dispensa",  defaultQty: "1",   defaultUnit: "pz" },
  { id: "d36", name: "Salmone",           cat: "carne",     defaultQty: "300", defaultUnit: "g"  },
  { id: "d37", name: "Shampoo",           cat: "igiene",    defaultQty: "1",   defaultUnit: "pz" },
  { id: "d38", name: "Succo d'arancia",   cat: "bevande",   defaultQty: "2",   defaultUnit: "L"  },
  { id: "d39", name: "Uova",              cat: "latticini", defaultQty: "6",   defaultUnit: "pz" },
  { id: "d40", name: "Vino rosso",        cat: "bevande",   defaultQty: "1",   defaultUnit: "pz" },
  { id: "d41", name: "Yogurt",            cat: "latticini", defaultQty: "4",   defaultUnit: "pz" },
  { id: "d42", name: "Zucchero",          cat: "dispensa",  defaultQty: "1",   defaultUnit: "kg" },
  { id: "d43", name: "Zucchine",          cat: "frutta",    defaultQty: "500", defaultUnit: "g"  },
];

const SCREENS = { HOME: "home", LIST: "list", CATEGORIE: "categorie", DISPENSA: "dispensa", GESTIONE_CAT: "gestione_cat" };
const emptyProductForm = () => ({ name: "", cat: "frutta", defaultQty: "1", defaultUnit: "pz" });
const emptyCatForm     = () => ({ label: "", icon: "🛍️", color: "#9E9E9E" });

// ════════════════════════════════════════
export default function App() {
  const [categories, setCategories]       = useState(DEFAULT_CATEGORIES);
  const [dispensa, setDispensa]           = useState(INITIAL_DISPENSA);
  const [lists, setLists]                 = useState([]);
  const [activeListId, setActiveListId]   = useState(null);
  const [screen, setScreen]               = useState(SCREENS.HOME);
  const [loaded, setLoaded]               = useState(false); // ← flag caricamento
  const [newListName, setNewListName]     = useState("");
  const [showNewList, setShowNewList]     = useState(false);
  const [toast, setToast]                 = useState(null);
  const [dispensaSearch, setDispensaSearch]       = useState("");
  const [dispensaCatFilter, setDispensaCatFilter] = useState(null);
  const [showProductModal, setShowProductModal]   = useState(false);
  const [editingProduct, setEditingProduct]       = useState(null);
  const [productForm, setProductForm]             = useState(emptyProductForm());
  const [showListItemModal, setShowListItemModal] = useState(false);
  const [editingListItem, setEditingListItem]     = useState(null);
  const [listItemForm, setListItemForm]           = useState({ qty: "1", unit: "pz" });
  const [showCatModal, setShowCatModal]           = useState(false);
  const [editingCat, setEditingCat]               = useState(null);
  const [catForm, setCatForm]                     = useState(emptyCatForm());
  const toastTimer = useRef(null);

  // ════════════════════════════════════════
  // PERSISTENZA: carica dati all'avvio
  // ════════════════════════════════════════
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedCats, savedDispensa, savedLists] = await Promise.all([
          AsyncStorage.getItem("lsm_categories"),
          AsyncStorage.getItem("lsm_dispensa"),
          AsyncStorage.getItem("lsm_lists"),
        ]);
        if (savedCats)     setCategories(JSON.parse(savedCats));
        if (savedDispensa) setDispensa(JSON.parse(savedDispensa));
        if (savedLists)    setLists(JSON.parse(savedLists));
      } catch (e) {
        console.error("Errore caricamento dati:", e);
      } finally {
        setLoaded(true);
      }
    };
    loadData();
  }, []);

  // ════════════════════════════════════════
  // PERSISTENZA: salva ad ogni modifica
  // ════════════════════════════════════════
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem("lsm_categories", JSON.stringify(categories)).catch(console.error);
  }, [categories, loaded]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem("lsm_dispensa", JSON.stringify(dispensa)).catch(console.error);
  }, [dispensa, loaded]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem("lsm_lists", JSON.stringify(lists)).catch(console.error);
  }, [lists, loaded]);

  // ════════════════════════════════════════
  // SCHERMATA DI CARICAMENTO
  // ════════════════════════════════════════
  if (!loaded) return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#2E7D32" }}>
      <Text style={{ fontSize: 60 }}>🛒</Text>
      <Text style={{ color: "white", fontSize: 22, fontWeight: "900", marginTop: 20 }}>ListaSpesaMax</Text>
      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 8 }}>Caricamento...</Text>
    </View>
  );

  const getCat = (id) => categories.find((c) => c.id === id) || categories[categories.length - 1];
  const activeList = lists.find((l) => l.id === activeListId);

  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  // ── LISTE ──
  const createList = () => {
    if (!newListName.trim()) return;
    const nl = { id: Date.now().toString(), name: newListName.trim(), items: [] };
    setLists((p) => [...p, nl]);
    setNewListName(""); setShowNewList(false);
    setActiveListId(nl.id); setScreen(SCREENS.CATEGORIE);
    showToast(`Lista "${nl.name}" creata!`);
  };

  const deleteList = (listId) => {
    Alert.alert("Cancella Lista", "La lista verrà eliminata. I prodotti restano in Dispensa.", [
      { text: "Annulla", style: "cancel" },
      { text: "Elimina", style: "destructive", onPress: () => {
        setLists((p) => p.filter((l) => l.id !== listId));
        setScreen(SCREENS.HOME); showToast("Lista eliminata");
      }},
    ]);
  };

  // ── DISPENSA → LISTA ──
  const addToList = (dispensaItem) => {
    if (!activeList) return;
    if (activeList.items.some((i) => i.dispensaId === dispensaItem.id)) { showToast("Già nella lista!"); return; }
    const newItem = { id: Date.now().toString(), dispensaId: dispensaItem.id, name: dispensaItem.name, cat: dispensaItem.cat, qty: dispensaItem.defaultQty, unit: dispensaItem.defaultUnit, checked: false };
    setLists((p) => p.map((l) => l.id === activeListId ? { ...l, items: [...l.items, newItem] } : l));
    showToast(`"${dispensaItem.name}" aggiunto`);
  };

  const removeFromList  = (itemId) => setLists((p) => p.map((l) => l.id !== activeListId ? l : { ...l, items: l.items.filter((i) => i.id !== itemId) }));
  const removeFromListByDispensaId = (dispensaId) => {
    setLists((p) => p.map((l) => l.id !== activeListId ? l : { ...l, items: l.items.filter((i) => i.dispensaId !== dispensaId) }));
    showToast("Rimosso dalla lista");
  };
  const toggleItem      = (itemId) => setLists((p) => p.map((l) => l.id !== activeListId ? l : { ...l, items: l.items.map((i) => i.id === itemId ? { ...i, checked: !i.checked } : i) }));

  // ── MODIFICA ITEM IN LISTA ──
  const openEditListItem = (item) => { setEditingListItem(item.id); setListItemForm({ qty: item.qty, unit: item.unit }); setShowListItemModal(true); };
  const saveListItem = () => {
    setLists((p) => p.map((l) => l.id !== activeListId ? l : { ...l, items: l.items.map((i) => i.id === editingListItem ? { ...i, ...listItemForm } : i) }));
    setShowListItemModal(false); showToast("Aggiornato");
  };

  // ── GESTIONE DISPENSA ──
  const openAddProduct  = () => { setEditingProduct(null); setProductForm(emptyProductForm()); setShowProductModal(true); };
  const openEditProduct = (p) => { setEditingProduct(p.id); setProductForm({ name: p.name, cat: p.cat, defaultQty: p.defaultQty, defaultUnit: p.defaultUnit }); setShowProductModal(true); };
  const saveProduct = () => {
    if (!productForm.name.trim()) return;
    if (editingProduct) {
      setDispensa((prev) => prev.map((p) => p.id === editingProduct ? { ...p, ...productForm, name: productForm.name.trim() } : p));
      showToast("Prodotto aggiornato");
    } else {
      setDispensa((prev) => [...prev, { ...productForm, id: "d" + Date.now(), name: productForm.name.trim() }]);
      showToast("Aggiunto alla Dispensa");
    }
    setShowProductModal(false);
  };
  const deleteProduct = (id) => {
    Alert.alert("Elimina", "Rimuovere dalla Dispensa?", [
      { text: "Annulla", style: "cancel" },
      { text: "Elimina", style: "destructive", onPress: () => { setDispensa((p) => p.filter((d) => d.id !== id)); showToast("Eliminato"); }},
    ]);
  };

  // ── GESTIONE CATEGORIE ──
  const openAddCat  = () => { setEditingCat(null); setCatForm(emptyCatForm()); setShowCatModal(true); };
  const openEditCat = (cat) => { setEditingCat(cat.id); setCatForm({ label: cat.label, icon: cat.icon, color: cat.color }); setShowCatModal(true); };
  const saveCat = () => {
    if (!catForm.label.trim()) return;
    if (editingCat) {
      setCategories((prev) => prev.map((c) => c.id === editingCat ? { ...c, ...catForm, label: catForm.label.trim() } : c));
      showToast("Categoria aggiornata");
    } else {
      setCategories((prev) => [...prev, { ...catForm, label: catForm.label.trim(), id: "cat_" + Date.now() }]);
      showToast("Categoria creata");
    }
    setShowCatModal(false);
  };
  const deleteCat = (id) => {
    Alert.alert("Elimina categoria", "I prodotti diventeranno 'Altro'.", [
      { text: "Annulla", style: "cancel" },
      { text: "Elimina", style: "destructive", onPress: () => {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setDispensa((prev) => prev.map((p) => p.cat === id ? { ...p, cat: "altro" } : p));
        showToast("Categoria eliminata");
      }},
    ]);
  };

  const handleShare = async () => {
    if (!activeList) return;
    const text = activeList.items.map((i) => `${i.checked ? "✅" : "⬜"} ${i.name} — ${i.qty} ${i.unit}`).join("\n");
    try { await Share.share({ message: `🛒 ${activeList.name}\n\n${text}` }); } catch (e) {}
  };

  // ── DATI CALCOLATI ──
  const listItemIds = activeList ? activeList.items.map((i) => i.dispensaId) : [];

  const filteredDispensa = dispensa
    .filter((p) => p.name.toLowerCase().includes(dispensaSearch.toLowerCase()) && (!dispensaCatFilter || p.cat === dispensaCatFilter))
    .sort((a, b) => {
      const aIn = listItemIds.includes(a.id);
      const bIn = listItemIds.includes(b.id);
      if (aIn !== bIn) return aIn ? 1 : -1;            // già in lista → in fondo
      return a.name.localeCompare(b.name, "it");
    });

  const dispensaSections = categories
    .map((cat) => ({ cat, data: filteredDispensa.filter((p) => p.cat === cat.id) }))
    .filter((s) => s.data.length > 0);

  const listSections = (() => {
    if (!activeList) return [];
    const uncheckedItems = activeList.items.filter((i) => !i.checked);
    const checkedItems   = activeList.items.filter((i) => i.checked);

    const activeSections = categories
      .map((cat) => ({
        cat,
        data: uncheckedItems
          .filter((i) => i.cat === cat.id)
          .sort((a, b) => a.name.localeCompare(b.name, "it"))
      }))
      .filter((s) => s.data.length > 0);

    if (checkedItems.length > 0) {
      activeSections.push({
        cat: { id: "__checked__", label: "Acquistati", icon: "✓", color: "#9E9E9E" },
        isChecked: true,
        data: checkedItems.sort((a, b) => a.name.localeCompare(b.name, "it"))
      });
    }
    return activeSections;
  })();

  // ════════════════════════════════════════
  // SCREEN: HOME
  // ════════════════════════════════════════
  if (screen === SCREENS.HOME) return (
    <View style={st.root}>
      <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />
      <View style={st.homeHeader}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
          <View>
            <Text style={st.homeTitle}>🛒 ListaSpesaMax</Text>
            <Text style={st.homeSub}>{lists.length} {lists.length === 1 ? "lista" : "liste"}</Text>
          </View>
          <TouchableOpacity onPress={() => setScreen(SCREENS.GESTIONE_CAT)} style={st.headerIconBtn}>
            <Text style={st.headerIconBtnTxt}>🗂</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={st.scroll} contentContainerStyle={{ padding: 16 }}>
        {lists.length === 0 && (
          <View style={st.emptyBox}>
            <Text style={{ fontSize: 52, textAlign: "center" }}>🛒</Text>
            <Text style={st.emptyTxt}>Nessuna lista ancora.{"\n"}Premi + per crearne una!</Text>
          </View>
        )}
        {lists.map((list) => {
          const done = list.items.filter((i) => i.checked).length;
          const tot = list.items.length;
          return (
            <TouchableOpacity key={list.id} style={st.listCard}
              onPress={() => { setActiveListId(list.id); setScreen(SCREENS.LIST); }}>
              <View style={st.listCardLeft}>
                <Text style={st.listCardName}>{list.name}</Text>
                <Text style={st.listCardMeta}>{tot} prodotti · {done} acquistati</Text>
                <View style={st.miniBar}><View style={[st.miniBarFill, { width: tot > 0 ? `${(done / tot) * 100}%` : "0%" }]} /></View>
              </View>
              <Text style={st.listCardArrow}>›</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 90 }} />
      </ScrollView>

      <TouchableOpacity style={st.fab} onPress={() => setShowNewList(true)}>
        <Text style={st.fabTxt}>+</Text>
      </TouchableOpacity>

      <Modal visible={showNewList} transparent animationType="fade" onRequestClose={() => setShowNewList(false)}>
        <KeyboardAvoidingView style={st.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={st.alertBox}>
            <Text style={st.alertTitle}>📋 Nuova Lista</Text>
            <TextInput style={st.alertInput} placeholder="Nome lista..." value={newListName}
              onChangeText={setNewListName} autoFocus onSubmitEditing={createList} />
            <View style={st.alertBtns}>
              <TouchableOpacity style={st.alertBtnCancel} onPress={() => { setShowNewList(false); setNewListName(""); }}>
                <Text style={st.alertBtnCancelTxt}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.alertBtnOk} onPress={createList}>
                <Text style={st.alertBtnOkTxt}>Crea</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {toast && <View style={st.toast} pointerEvents="none"><Text style={st.toastTxt}>{toast}</Text></View>}
    </View>
  );

  // ════════════════════════════════════════
  // SCREEN: GESTIONE CATEGORIE
  // ════════════════════════════════════════
  if (screen === SCREENS.GESTIONE_CAT) return (
    <View style={st.root}>
      <StatusBar backgroundColor="#4A148C" barStyle="light-content" />
      <View style={[st.header, { backgroundColor: "#6A1B9A" }]}>
        <View style={st.headerRow}>
          <TouchableOpacity onPress={() => setScreen(SCREENS.HOME)} style={st.hBtn}>
            <Text style={st.hBtnTxt}>←</Text>
          </TouchableOpacity>
          <Text style={st.headerTitle}>🗂 Gestione Categorie</Text>
          <TouchableOpacity onPress={openAddCat} style={st.hBtn}>
            <Text style={st.hBtnTxt}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={st.scroll} contentContainerStyle={{ padding: 16 }}>
        {categories.map((cat) => (
          <View key={cat.id} style={st.catManageRow}>
            <View style={[st.catManageDot, { backgroundColor: cat.color }]}>
              <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
            </View>
            <Text style={st.catManageLabel}>{cat.label}</Text>
            <TouchableOpacity onPress={() => openEditCat(cat)} style={st.catManageBtn}>
              <Text style={st.catManageBtnTxt}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteCat(cat.id)} style={st.catManageBtn}>
              <Text style={st.catManageBtnTxt}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showCatModal} transparent animationType="slide" onRequestClose={() => setShowCatModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={st.bottomSheet}>
            <View style={st.sheetHandle} />
            <Text style={st.sheetTitle}>{editingCat ? "✏️ Modifica Categoria" : "➕ Nuova Categoria"}</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={st.formLabel}>Nome</Text>
              <TextInput style={st.input} placeholder="es. Animali" value={catForm.label}
                onChangeText={(v) => setCatForm({ ...catForm, label: v })} autoFocus />
              <Text style={st.formLabel}>Icona</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: "row", gap: 10, paddingVertical: 6 }}>
                  {CAT_ICONS.map((ic) => (
                    <TouchableOpacity key={ic} onPress={() => setCatForm({ ...catForm, icon: ic })}
                      style={[st.iconChip, catForm.icon === ic && { backgroundColor: catForm.color }]}>
                      <Text style={{ fontSize: 22 }}>{ic}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <Text style={st.formLabel}>Colore</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
                {CAT_COLORS.map((c) => (
                  <TouchableOpacity key={c} onPress={() => setCatForm({ ...catForm, color: c })}
                    style={[st.colorDot, { backgroundColor: c }, catForm.color === c && st.colorDotActive]} />
                ))}
              </View>
              <TouchableOpacity style={[st.saveBtn, { backgroundColor: catForm.color || "#9C27B0" }]} onPress={saveCat}>
                <Text style={st.saveBtnTxt}>{editingCat ? "💾 Salva Modifiche" : "➕ Crea Categoria"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.cancelBtn} onPress={() => setShowCatModal(false)}>
                <Text style={st.cancelBtnTxt}>Annulla</Text>
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {toast && <View style={st.toast} pointerEvents="none"><Text style={st.toastTxt}>{toast}</Text></View>}
    </View>
  );

  // ════════════════════════════════════════
  // SCREEN: CATEGORIE (scelta prima di vedere i prodotti)
  // ════════════════════════════════════════
  if (screen === SCREENS.CATEGORIE) {
    const totalDispensa = dispensa.length;
    const goToDispensa = (catId) => { setDispensaCatFilter(catId); setDispensaSearch(""); setScreen(SCREENS.DISPENSA); };
    return (
      <View style={st.root}>
        <StatusBar backgroundColor="#1565C0" barStyle="light-content" />
        <View style={[st.header, { backgroundColor: "#1976D2" }]}>
          <View style={st.headerRow}>
            <TouchableOpacity onPress={() => setScreen(SCREENS.LIST)} style={st.hBtn}>
              <Text style={st.hBtnTxt}>←</Text>
            </TouchableOpacity>
            <Text style={st.headerTitle}>📂 Scegli categoria</Text>
            <View style={{ width: 30 }} />
          </View>
          <Text style={st.headerSub}>Per «{activeList?.name}»</Text>
        </View>

        <ScrollView style={st.scroll} contentContainerStyle={{ padding: 12 }}>
          <TouchableOpacity
            style={[st.bigCatCardWide, { backgroundColor: "#1976D2" }]}
            onPress={() => goToDispensa(null)} activeOpacity={0.85}>
            <Text style={st.bigCatIcon}>🛒</Text>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={st.bigCatLabelWide}>Tutti i prodotti</Text>
              <Text style={st.bigCatCountWide}>{totalDispensa} prodotti in dispensa</Text>
            </View>
            <Text style={st.bigCatArrow}>›</Text>
          </TouchableOpacity>

          <View style={st.catGridBig}>
            {categories.map((cat) => {
              const count = dispensa.filter((p) => p.cat === cat.id).length;
              return (
                <TouchableOpacity key={cat.id}
                  style={[st.bigCatCard, { backgroundColor: cat.color }]}
                  onPress={() => goToDispensa(cat.id)} activeOpacity={0.85}>
                  <Text style={st.bigCatIcon}>{cat.icon}</Text>
                  <Text style={st.bigCatLabel} numberOfLines={2}>{cat.label}</Text>
                  <Text style={st.bigCatCount}>{count} {count === 1 ? "prodotto" : "prodotti"}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>

        {toast && <View style={st.toast} pointerEvents="none"><Text style={st.toastTxt}>{toast}</Text></View>}
      </View>
    );
  }

  // ════════════════════════════════════════
  // SCREEN: DISPENSA
  // ════════════════════════════════════════
  if (screen === SCREENS.DISPENSA) {
    return (
      <View style={st.root}>
        <StatusBar backgroundColor="#1565C0" barStyle="light-content" />
        <View style={[st.header, { backgroundColor: "#1976D2" }]}>
          <View style={st.headerRow}>
            <TouchableOpacity onPress={() => setScreen(SCREENS.CATEGORIE)} style={st.hBtn}>
              <Text style={st.hBtnTxt}>←</Text>
            </TouchableOpacity>
            <Text style={st.headerTitle} numberOfLines={1}>
              {dispensaCatFilter ? `${getCat(dispensaCatFilter).icon} ${getCat(dispensaCatFilter).label}` : "🫙 Tutti i prodotti"}
            </Text>
            <TouchableOpacity onPress={openAddProduct} style={st.hBtn}>
              <Text style={st.hBtnTxt}>＋</Text>
            </TouchableOpacity>
          </View>
          <Text style={st.headerSub}>Seleziona prodotti per «{activeList?.name}»</Text>
          <TextInput style={st.searchInput} placeholder="Cerca prodotto..." placeholderTextColor="rgba(255,255,255,0.6)"
            value={dispensaSearch} onChangeText={setDispensaSearch} />
        </View>

        <SectionList
          style={{ flex: 1 }}
          sections={dispensaSections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section: { cat } }) => (
            <View style={[st.secHeader, { borderLeftColor: cat.color }]}>
              <Text style={[st.secHeaderTxt, { color: cat.color }]}>{cat.icon}  {cat.label.toUpperCase()}</Text>
            </View>
          )}
          renderItem={({ item }) => {
            const inList = listItemIds.includes(item.id);
            return (
              <View style={[st.dispensaItem, inList && st.dispensaItemAdded]}>
                <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                  onPress={() => inList ? removeFromListByDispensaId(item.id) : addToList(item)} activeOpacity={0.7}>
                  <View style={[st.catStrip, { backgroundColor: getCat(item.cat).color, opacity: inList ? 0.3 : 1 }]} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[st.dispensaItemName, inList && st.dispensaItemNameAdded]}>{item.name}</Text>
                    <Text style={st.dispensaItemMeta}>{item.defaultQty} {item.defaultUnit}</Text>
                  </View>
                  {inList ? <Text style={st.addedBadge}>✓</Text> : <Text style={st.addBtnTxt}>＋</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openEditProduct(item)} style={st.editSmallBtn}>
                  <Text style={st.editSmallTxt}>✏️</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={<View style={st.emptyBox}><Text style={{ fontSize: 40 }}>🔍</Text><Text style={st.emptyTxt}>Nessun prodotto trovato</Text></View>}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />

        <TouchableOpacity style={[st.fab, { backgroundColor: "#1976D2" }]} onPress={() => setScreen(SCREENS.LIST)}>
          <Text style={{ color: "white", fontSize: 12, fontWeight: "800", textAlign: "center" }}>Lista{"\n"}({activeList?.items.length})</Text>
        </TouchableOpacity>

        <ProductModal visible={showProductModal} onClose={() => setShowProductModal(false)}
          form={productForm} setForm={setProductForm} onSave={saveProduct}
          onDelete={editingProduct ? () => { deleteProduct(editingProduct); setShowProductModal(false); } : null}
          isEdit={!!editingProduct} categories={categories} getCat={getCat} />

        {toast && <View style={st.toast} pointerEvents="none"><Text style={st.toastTxt}>{toast}</Text></View>}
      </View>
    );
  }

  // ════════════════════════════════════════
  // SCREEN: LISTA
  // ════════════════════════════════════════
  if (screen === SCREENS.LIST && activeList) {
    const checkedCount = activeList.items.filter((i) => i.checked).length;
    const totalCount   = activeList.items.length;
    const progress     = totalCount > 0 ? checkedCount / totalCount : 0;

    return (
      <View style={st.root}>
        <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />
        <View style={st.header}>
          <View style={st.headerRow}>
            <TouchableOpacity onPress={() => setScreen(SCREENS.HOME)} style={st.hBtn}>
              <Text style={st.hBtnTxt}>←</Text>
            </TouchableOpacity>
            <Text style={st.headerTitle}>{activeList.name}</Text>
            <TouchableOpacity onPress={handleShare} style={st.hBtn}><Text style={st.hBtnTxt}>↗</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => deleteList(activeList.id)} style={st.hBtn}><Text style={st.hBtnTxt}>🗑</Text></TouchableOpacity>
          </View>
          <View style={st.progressRow}>
            <View style={st.progressBg}><View style={[st.progressFill, { width: `${progress * 100}%` }]} /></View>
            <Text style={st.progressLabel}>{checkedCount}/{totalCount}</Text>
          </View>
        </View>

        <TouchableOpacity style={st.dispensaBtn} onPress={() => { setDispensaCatFilter(null); setScreen(SCREENS.CATEGORIE); }}>
          <Text style={st.dispensaBtnTxt}>🫙 Aggiungi dalla Dispensa</Text>
        </TouchableOpacity>

        <SectionList
          sections={listSections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            section.isChecked ? (
              <View style={st.checkedSecHeader}>
                <Text style={st.checkedSecHeaderTxt}>✓ ACQUISTATI ({section.data.length})</Text>
              </View>
            ) : (
              <View style={[st.secHeader, { borderLeftColor: section.cat.color }]}>
                <Text style={[st.secHeaderTxt, { color: section.cat.color }]}>{section.cat.icon}  {section.cat.label.toUpperCase()}</Text>
              </View>
            )
          )}
          renderItem={({ item }) => (
            <ListItemRow item={item} getCat={getCat}
              onToggle={() => toggleItem(item.id)}
              onDelete={() => removeFromList(item.id)}
              onEdit={() => openEditListItem(item)} />
          )}
          ListEmptyComponent={
            <View style={st.emptyBox}>
              <Text style={{ fontSize: 52, textAlign: "center" }}>🛒</Text>
              <Text style={st.emptyTxt}>Lista vuota!{"\n"}Aggiungi prodotti dalla Dispensa.</Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 80 }} />}
        />

        {/* Modal modifica quantità in lista */}
        <Modal visible={showListItemModal} transparent animationType="fade" onRequestClose={() => setShowListItemModal(false)}>
          <KeyboardAvoidingView style={st.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={st.alertBox}>
              <Text style={st.alertTitle}>✏️ Modifica quantità</Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                <TextInput style={[st.alertInput, { flex: 1, marginBottom: 0 }]} keyboardType="numeric"
                  value={listItemForm.qty} onChangeText={(v) => setListItemForm({ ...listItemForm, qty: v })} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 2 }}>
                  <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                    {UNITS.map((u) => (
                      <TouchableOpacity key={u} onPress={() => setListItemForm({ ...listItemForm, unit: u })}
                        style={[st.unitChip, listItemForm.unit === u && { backgroundColor: "#4CAF50" }]}>
                        <Text style={[st.unitTxt, listItemForm.unit === u && { color: "white" }]}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <View style={st.alertBtns}>
                <TouchableOpacity style={st.alertBtnCancel} onPress={() => setShowListItemModal(false)}>
                  <Text style={st.alertBtnCancelTxt}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity style={st.alertBtnOk} onPress={saveListItem}>
                  <Text style={st.alertBtnOkTxt}>Salva</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {toast && <View style={st.toast} pointerEvents="none"><Text style={st.toastTxt}>{toast}</Text></View>}
      </View>
    );
  }

  return null;
}

// ── ListItemRow ──
function ListItemRow({ item, getCat, onToggle, onDelete, onEdit }) {
  const cat = getCat(item.cat);
  return (
    <View style={st.listItemWrap}>
      <View style={st.listItemRow}>
        <View style={[st.catStrip, { backgroundColor: cat.color }]} />
        <TouchableOpacity onPress={onToggle}
          style={[st.checkbox, { borderColor: item.checked ? cat.color : "#ccc", backgroundColor: item.checked ? cat.color : "white" }]}>
          {item.checked && <Text style={st.checkmark}>✓</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onPress={onToggle} activeOpacity={0.7}>
          <Text style={[st.listItemName, item.checked && st.listItemNameDone]}>{item.name}</Text>
          <Text style={st.listItemMeta}>{item.qty} {item.unit}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onEdit} style={st.editSmallBtn}>
          <Text style={st.editSmallTxt}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={st.deleteItemBtn}>
          <Text style={st.deleteItemTxt}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── ProductModal ──
function ProductModal({ visible, onClose, form, setForm, onSave, onDelete, isEdit, categories, getCat }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={st.bottomSheet}>
          <View style={st.sheetHandle} />
          <Text style={st.sheetTitle}>{isEdit ? "✏️ Modifica Prodotto" : "➕ Nuovo Prodotto in Dispensa"}</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={st.formLabel}>Nome</Text>
            <TextInput style={st.input} placeholder="es. Tonno in scatola" value={form.name}
              onChangeText={(v) => setForm({ ...form, name: v })} autoFocus />
            <Text style={st.formLabel}>Quantità predefinita</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput style={[st.input, { flex: 1 }]} keyboardType="numeric" value={form.defaultQty}
                onChangeText={(v) => setForm({ ...form, defaultQty: v })} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 2 }}>
                <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                  {UNITS.map((u) => (
                    <TouchableOpacity key={u} onPress={() => setForm({ ...form, defaultUnit: u })}
                      style={[st.unitChip, form.defaultUnit === u && { backgroundColor: "#1976D2" }]}>
                      <Text style={[st.unitTxt, form.defaultUnit === u && { color: "white" }]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
            <Text style={st.formLabel}>Categoria</Text>
            <View style={st.catGrid}>
              {categories.map((cat) => (
                <TouchableOpacity key={cat.id} onPress={() => setForm({ ...form, cat: cat.id })}
                  style={[st.catChip, form.cat === cat.id && { backgroundColor: cat.color }]}>
                  <Text style={{ fontSize: 18 }}>{cat.icon}</Text>
                  <Text style={[st.catChipTxt, form.cat === cat.id && { color: "white" }]} numberOfLines={1}>
                    {cat.label.split(" ")[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[st.saveBtn, { backgroundColor: getCat(form.cat).color }]} onPress={onSave}>
              <Text style={st.saveBtnTxt}>{isEdit ? "💾 Salva Modifiche" : "➕ Aggiungi"}</Text>
            </TouchableOpacity>
            {isEdit && onDelete && (
              <TouchableOpacity style={[st.cancelBtn, { borderColor: "#F44336" }]} onPress={onDelete}>
                <Text style={[st.cancelBtnTxt, { color: "#F44336" }]}>🗑️ Elimina dalla Dispensa</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={st.cancelBtn} onPress={onClose}>
              <Text style={st.cancelBtnTxt}>Annulla</Text>
            </TouchableOpacity>
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── STILI ──
const GREEN = "#4CAF50";
const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f5f5" },
  homeHeader: { backgroundColor: "#2E7D32", paddingTop: Platform.OS === "android" ? 20 : 52, paddingHorizontal: 20, paddingBottom: 20 },
  homeTitle: { color: "white", fontSize: 26, fontWeight: "900" },
  homeSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 },
  headerIconBtn: { padding: 10, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10 },
  headerIconBtnTxt: { fontSize: 22 },
  header: { backgroundColor: GREEN, paddingTop: Platform.OS === "android" ? 14 : 50, paddingHorizontal: 14, paddingBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  headerTitle: { flex: 1, color: "white", fontSize: 17, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginBottom: 10 },
  hBtn: { padding: 6 },
  hBtnTxt: { color: "white", fontSize: 22, fontWeight: "700" },
  searchInput: { backgroundColor: "rgba(255,255,255,0.22)", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, color: "white", fontSize: 15 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressBg: { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: "white", borderRadius: 3 },
  progressLabel: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "700" },
  catFilterRow: { height: 52, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#eee", flexGrow: 0, flexShrink: 0 },
  catFilterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#f0f0f0", flexShrink: 0, justifyContent: "center" },
  catFilterTxt: { fontSize: 13, fontWeight: "700", color: "#555" },
  dispensaBtn: { backgroundColor: "#E3F2FD", margin: 12, borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 1.5, borderColor: "#1976D2", borderStyle: "dashed" },
  dispensaBtnTxt: { color: "#1976D2", fontWeight: "800", fontSize: 15 },
  scroll: { flex: 1 },
  emptyBox: { alignItems: "center", justifyContent: "center", paddingTop: 60, paddingHorizontal: 30 },
  emptyTxt: { color: "#bbb", fontSize: 15, textAlign: "center", marginTop: 12, lineHeight: 22 },
  listCard: { backgroundColor: "white", borderRadius: 14, padding: 16, marginBottom: 12, flexDirection: "row", alignItems: "center", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  listCardLeft: { flex: 1 },
  listCardName: { fontSize: 17, fontWeight: "800", color: "#222" },
  listCardMeta: { fontSize: 12, color: "#999", marginTop: 3, marginBottom: 8 },
  miniBar: { height: 4, backgroundColor: "#eee", borderRadius: 2 },
  miniBarFill: { height: 4, backgroundColor: GREEN, borderRadius: 2 },
  listCardArrow: { fontSize: 24, color: "#ccc", marginLeft: 12 },
  secHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 7, backgroundColor: "#fafafa", borderLeftWidth: 4, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  secHeaderTxt: { fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
  checkedSecHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: "#EEEEEE",
    borderTopWidth: 1, borderTopColor: "#ddd",
    borderBottomWidth: 1, borderBottomColor: "#ddd",
    marginTop: 14,
  },
  checkedSecHeaderTxt: { fontSize: 12, fontWeight: "900", letterSpacing: 1, color: "#777" },
  dispensaItem: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#f0f0f0", paddingVertical: 11, paddingRight: 10 },
  dispensaItemAdded: { backgroundColor: "#FAFAFA" },
  dispensaItemName: { fontSize: 15, fontWeight: "700", color: "#222" },
  dispensaItemNameAdded: { color: "#bbb" },
  dispensaItemMeta: { fontSize: 12, color: "#aaa", marginTop: 2 },
  addedBadge: { fontSize: 14, color: "#4CAF50", fontWeight: "800", marginRight: 6 },
  addBtnTxt: { fontSize: 24, color: "#4CAF50", fontWeight: "300", marginRight: 6 },
  editSmallBtn: { padding: 8 },
  editSmallTxt: { fontSize: 16 },
  listItemWrap: { backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  listItemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13, paddingRight: 10, gap: 8 },
  catStrip: { width: 4, alignSelf: "stretch", borderRadius: 2 },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: "center", justifyContent: "center", marginLeft: 6 },
  checkmark: { color: "white", fontSize: 13, fontWeight: "700" },
  listItemName: { fontSize: 15, fontWeight: "700", color: "#222" },
  listItemNameDone: { textDecorationLine: "line-through", color: "#bbb" },
  listItemMeta: { fontSize: 12, color: "#999", marginTop: 2 },
  deleteItemBtn: { padding: 6 },
  deleteItemTxt: { fontSize: 16, color: "#ccc" },
  catManageRow: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2 },
  catManageDot: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", marginRight: 12 },
  catManageLabel: { flex: 1, fontSize: 15, fontWeight: "700", color: "#222" },
  catManageBtn: { padding: 8 },
  catManageBtnTxt: { fontSize: 20 },
  fab: { position: "absolute", bottom: 28, right: 22, width: 58, height: 58, borderRadius: 29, backgroundColor: GREEN, alignItems: "center", justifyContent: "center", elevation: 8, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  fabTxt: { color: "white", fontSize: 32, fontWeight: "300", marginTop: -2 },
  toast: { position: "absolute", bottom: 100, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.75)", paddingHorizontal: 20, paddingVertical: 9, borderRadius: 20 },
  toastTxt: { color: "white", fontSize: 13, fontWeight: "700" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  alertBox: { backgroundColor: "white", borderRadius: 18, padding: 22, width: "88%", elevation: 10 },
  alertTitle: { fontSize: 18, fontWeight: "800", color: "#222", marginBottom: 14 },
  alertInput: { backgroundColor: "#f5f5f5", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 16, borderWidth: 1.5, borderColor: "#e0e0e0", marginBottom: 16 },
  alertBtns: { flexDirection: "row", gap: 10 },
  alertBtnCancel: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: "#ddd", alignItems: "center" },
  alertBtnCancelTxt: { color: "#888", fontWeight: "700" },
  alertBtnOk: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: GREEN, alignItems: "center" },
  alertBtnOkTxt: { color: "white", fontWeight: "800" },
  bottomSheet: { backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingTop: 12, maxHeight: "92%" },
  sheetHandle: { width: 40, height: 4, backgroundColor: "#ddd", borderRadius: 2, alignSelf: "center", marginBottom: 14 },
  sheetTitle: { fontSize: 17, fontWeight: "800", color: "#222", marginBottom: 14 },
  formLabel: { fontSize: 12, fontWeight: "800", color: "#666", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "#f5f5f5", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, borderWidth: 1.5, borderColor: "#e0e0e0", color: "#222" },
  unitChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: "#f0f0f0" },
  unitTxt: { fontSize: 13, fontWeight: "700", color: "#555" },
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  catChip: { width: "22%", aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#f0f0f0", gap: 2 },
  catChipTxt: { fontSize: 10, fontWeight: "700", color: "#555", textAlign: "center" },
  saveBtn: { borderRadius: 12, paddingVertical: 15, alignItems: "center", marginTop: 16 },
  saveBtnTxt: { color: "white", fontSize: 15, fontWeight: "800" },
  cancelBtn: { borderRadius: 12, paddingVertical: 13, alignItems: "center", marginTop: 10, borderWidth: 1.5, borderColor: "#ddd" },
  cancelBtnTxt: { color: "#888", fontSize: 14, fontWeight: "700" },
  iconChip: { width: 44, height: 44, borderRadius: 10, backgroundColor: "#f0f0f0", alignItems: "center", justifyContent: "center" },
  colorDot: { width: 34, height: 34, borderRadius: 17 },
  colorDotActive: { borderWidth: 3, borderColor: "#222" },
  // ── PAGINA CATEGORIE ──
  catGridBig: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  bigCatCard: {
    width: "48%", aspectRatio: 1, borderRadius: 16, padding: 14,
    alignItems: "center", justifyContent: "center",
    elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4,
  },
  bigCatCardWide: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 16, padding: 18, marginBottom: 14,
    elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4,
  },
  bigCatIcon: { fontSize: 44 },
  bigCatLabel: { color: "white", fontSize: 14, fontWeight: "900", textAlign: "center", marginTop: 8 },
  bigCatLabelWide: { color: "white", fontSize: 17, fontWeight: "900" },
  bigCatCount: { color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: "700", marginTop: 4, textAlign: "center" },
  bigCatCountWide: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "700", marginTop: 2 },
  bigCatArrow: { color: "white", fontSize: 28, fontWeight: "300", marginLeft: 8 },
});
