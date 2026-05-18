import { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Modal, Alert, Share,
  Animated, Platform, KeyboardAvoidingView, FlatList
} from "react-native";

// ── CATEGORIE ──
const CATEGORIES = [
  { id: "frutta",   label: "Frutta & Verdura",  icon: "🥦", color: "#4CAF50" },
  { id: "carne",    label: "Carne & Pesce",      icon: "🥩", color: "#F44336" },
  { id: "latticini",label: "Latticini & Uova",   icon: "🥛", color: "#FFC107" },
  { id: "pane",     label: "Pane & Cereali",     icon: "🍞", color: "#FF9800" },
  { id: "bevande",  label: "Bevande",            icon: "🧃", color: "#2196F3" },
  { id: "snack",    label: "Snack & Dolci",      icon: "🍫", color: "#9C27B0" },
  { id: "surgelati",label: "Surgelati",          icon: "❄️", color: "#00BCD4" },
  { id: "igiene",   label: "Igiene & Pulizia",   icon: "🧼", color: "#607D8B" },
  { id: "dispensa", label: "Dispensa",           icon: "🫙", color: "#795548" },
  { id: "altro",    label: "Altro",              icon: "🛍️", color: "#9E9E9E" },
];

const UNITS = ["pz", "g", "kg", "L", "ml", "conf", "busta", "scatola"];

const getCat = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

const INITIAL_ITEMS = [
  { id: "1", name: "Mele Golden",       qty: "1",   unit: "kg",  cat: "frutta",    checked: false, price: "1.80", note: "" },
  { id: "2", name: "Petto di pollo",    qty: "500", unit: "g",   cat: "carne",     checked: false, price: "4.50", note: "" },
  { id: "3", name: "Mozzarella",        qty: "2",   unit: "pz",  cat: "latticini", checked: true,  price: "1.20", note: "" },
  { id: "4", name: "Pane di casa",      qty: "1",   unit: "pz",  cat: "pane",      checked: false, price: "2.00", note: "" },
  { id: "5", name: "Acqua frizzante",   qty: "6",   unit: "pz",  cat: "bevande",   checked: false, price: "3.60", note: "1.5L" },
  { id: "6", name: "Cioccolato fondente",qty:"2",   unit: "pz",  cat: "snack",     checked: false, price: "2.40", note: "" },
];

// ── EMPTY FORM ──
const emptyForm = () => ({ name: "", qty: "1", unit: "pz", cat: "frutta", price: "", note: "" });

// ══════════════════════════════════════════
// APP
// ══════════════════════════════════════════
export default function App() {
  const [items, setItems]           = useState(INITIAL_ITEMS);
  const [viewMode, setViewMode]     = useState("list"); // list | category
  const [showChecked, setShowChecked] = useState(true);
  const [search, setSearch]         = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId]         = useState(null);
  const [form, setForm]             = useState(emptyForm());
  const [toast, setToast]           = useState(null);
  const toastTimer                  = useRef(null);

  // ── helpers ──
  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  };

  const toggleItem = (id) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    showToast("Prodotto eliminato");
  };

  const deleteChecked = () => {
    Alert.alert("Rimuovi completati", "Vuoi eliminare tutti i prodotti spuntati?", [
      { text: "Annulla", style: "cancel" },
      { text: "Elimina", style: "destructive", onPress: () => { setItems((prev) => prev.filter((i) => !i.checked)); showToast("Rimossi!"); } },
    ]);
  };

  const openAdd = () => { setForm(emptyForm()); setEditId(null); setModalVisible(true); };

  const openEdit = (item) => {
    setForm({ name: item.name, qty: item.qty, unit: item.unit, cat: item.cat, price: item.price, note: item.note });
    setEditId(item.id);
    setModalVisible(true);
  };

  const saveItem = () => {
    if (!form.name.trim()) { showToast("Inserisci un nome!"); return; }
    if (editId) {
      setItems((prev) => prev.map((i) => (i.id === editId ? { ...i, ...form } : i)));
      showToast("Aggiornato!");
    } else {
      setItems((prev) => [...prev, { ...form, id: Date.now().toString(), checked: false }]);
      showToast("Aggiunto!");
    }
    setModalVisible(false);
  };

  const handleShare = async () => {
    const text = items
      .map((i) => `${i.checked ? "✅" : "⬜"} ${i.name} — ${i.qty} ${i.unit}${i.price ? ` (€${i.price})` : ""}`)
      .join("\n");
    try {
      await Share.share({ message: `🛒 Lista della Spesa\n\n${text}` });
    } catch (e) {}
  };

  // ── computed ──
  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount   = items.length;
  const totalPrice   = items
    .filter((i) => !i.checked)
    .reduce((sum, i) => sum + (parseFloat(i.price) || 0) * (parseFloat(i.qty) || 1), 0);

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );
  const visible = showChecked ? filtered : filtered.filter((i) => !i.checked);

  const grouped = CATEGORIES.map((cat) => ({
    cat,
    data: visible.filter((i) => i.cat === cat.id),
  })).filter((g) => g.data.length > 0);

  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════
  return (
    <View style={st.root}>
      <StatusBar backgroundColor="#388E3C" barStyle="light-content" />

      {/* ── HEADER ── */}
      <View style={st.header}>
        <View style={st.headerRow}>
          <Text style={st.headerTitle}>🛒 La Mia Spesa</Text>
          <View style={st.headerActions}>
            <TouchableOpacity onPress={() => { setShowSearch(!showSearch); setSearch(""); }} style={st.hBtn}>
              <Text style={st.hBtnTxt}>{showSearch ? "✕" : "🔍"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={st.hBtn}>
              <Text style={st.hBtnTxt}>↗</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showSearch && (
          <TextInput
            style={st.searchInput}
            placeholder="Cerca prodotto..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
        )}

        {/* Progress bar */}
        <View style={st.progressRow}>
          <View style={st.progressBg}>
            <View style={[st.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={st.progressLabel}>{checkedCount}/{totalCount}</Text>
        </View>

        {totalPrice > 0 && (
          <View style={st.budgetRow}>
            <Text style={st.budgetLabel}>Totale stimato:</Text>
            <Text style={st.budgetValue}>€ {totalPrice.toFixed(2)}</Text>
          </View>
        )}
      </View>

      {/* ── TOOLBAR ── */}
      <View style={st.toolbar}>
        <TouchableOpacity
          onPress={() => setViewMode("list")}
          style={[st.viewBtn, viewMode === "list" && st.viewBtnActive]}>
          <Text style={[st.viewBtnTxt, viewMode === "list" && st.viewBtnTxtActive]}>☰ Lista</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode("category")}
          style={[st.viewBtn, viewMode === "category" && st.viewBtnActive]}>
          <Text style={[st.viewBtnTxt, viewMode === "category" && st.viewBtnTxtActive]}>🗂 Categoria</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => setShowChecked(!showChecked)} style={st.iconBtn}>
          <Text style={{ fontSize: 20 }}>{showChecked ? "👁" : "🙈"}</Text>
        </TouchableOpacity>
        {checkedCount > 0 && (
          <TouchableOpacity onPress={deleteChecked} style={st.iconBtn}>
            <Text style={{ fontSize: 20 }}>🗑</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── LIST ── */}
      <ScrollView style={st.scroll} keyboardShouldPersistTaps="handled">
        {visible.length === 0 && (
          <View style={st.empty}>
            <Text style={{ fontSize: 52 }}>🛒</Text>
            <Text style={st.emptyTxt}>{search ? "Nessun risultato" : "Lista vuota!\nPremi + per aggiungere."}</Text>
          </View>
        )}

        {viewMode === "list" && visible.map((item) => (
          <ItemRow key={item.id} item={item}
            onToggle={() => toggleItem(item.id)}
            onEdit={() => openEdit(item)}
            onDelete={() => deleteItem(item.id)} />
        ))}

        {viewMode === "category" && grouped.map(({ cat, data }) => (
          <View key={cat.id}>
            <View style={[st.catHeader, { borderLeftColor: cat.color }]}>
              <Text style={[st.catHeaderTxt, { color: cat.color }]}>{cat.icon}  {cat.label.toUpperCase()}</Text>
              <Text style={st.catCount}>{data.length}</Text>
            </View>
            {data.map((item) => (
              <ItemRow key={item.id} item={item}
                onToggle={() => toggleItem(item.id)}
                onEdit={() => openEdit(item)}
                onDelete={() => deleteItem(item.id)} />
            ))}
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity style={st.fab} onPress={openAdd} activeOpacity={0.85}>
        <Text style={st.fabTxt}>+</Text>
      </TouchableOpacity>

      {/* ── TOAST ── */}
      {toast && (
        <View style={st.toast} pointerEvents="none">
          <Text style={st.toastTxt}>{toast}</Text>
        </View>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={st.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={st.modalSheet}>
            <View style={st.modalHandle} />
            <Text style={st.modalTitle}>{editId ? "✏️ Modifica Prodotto" : "➕ Aggiungi Prodotto"}</Text>

            <ScrollView keyboardShouldPersistTaps="handled">
              <FormLabel>Nome prodotto *</FormLabel>
              <TextInput style={st.input} placeholder="es. Pasta barilla" value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })} autoFocus returnKeyType="next" />

              <FormLabel>Quantità</FormLabel>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput style={[st.input, { flex: 1 }]} keyboardType="numeric" value={form.qty}
                  onChangeText={(v) => setForm({ ...form, qty: v })} />
                {/* Unit picker */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                    {UNITS.map((u) => (
                      <TouchableOpacity key={u} onPress={() => setForm({ ...form, unit: u })}
                        style={[st.unitChip, form.unit === u && st.unitChipActive]}>
                        <Text style={[st.unitChipTxt, form.unit === u && { color: "white" }]}>{u}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <FormLabel>Prezzo (€)</FormLabel>
              <TextInput style={st.input} keyboardType="decimal-pad" placeholder="0.00" value={form.price}
                onChangeText={(v) => setForm({ ...form, price: v })} />

              <FormLabel>Note</FormLabel>
              <TextInput style={st.input} placeholder="es. marca, negozio..." value={form.note}
                onChangeText={(v) => setForm({ ...form, note: v })} />

              <FormLabel>Categoria</FormLabel>
              <View style={st.catGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity key={cat.id} onPress={() => setForm({ ...form, cat: cat.id })}
                    style={[st.catChip, form.cat === cat.id && { backgroundColor: cat.color }]}>
                    <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
                    <Text style={[st.catChipTxt, form.cat === cat.id && { color: "white" }]}>
                      {cat.label.split(" ")[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={[st.saveBtn, { backgroundColor: getCat(form.cat).color }]} onPress={saveItem}>
                <Text style={st.saveBtnTxt}>{editId ? "💾 Salva Modifiche" : "➕ Aggiungi"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={st.cancelBtnTxt}>Annulla</Text>
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ── ItemRow ──
function ItemRow({ item, onToggle, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const cat = getCat(item.cat);
  return (
    <View style={st.itemWrap}>
      <View style={st.itemRow}>
        <View style={[st.catStrip, { backgroundColor: cat.color }]} />
        <TouchableOpacity onPress={onToggle}
          style={[st.checkbox, { borderColor: item.checked ? cat.color : "#ccc", backgroundColor: item.checked ? cat.color : "white" }]}>
          {item.checked && <Text style={st.checkmark}>✓</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onPress={onToggle} activeOpacity={0.7}>
          <Text style={[st.itemName, item.checked && st.itemNameDone]} numberOfLines={1}>{item.name}</Text>
          <Text style={st.itemMeta}>
            {cat.icon} {item.qty} {item.unit}{item.price ? ` · €${item.price}` : ""}{item.note ? ` · ${item.note}` : ""}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={st.moreBtn}>
          <Text style={st.moreBtnTxt}>⋯</Text>
        </TouchableOpacity>
      </View>
      {expanded && (
        <View style={st.actionBar}>
          <TouchableOpacity style={st.actionBtn} onPress={() => { onEdit(); setExpanded(false); }}>
            <Text style={[st.actionBtnTxt, { color: "#2196F3" }]}>✏️ Modifica</Text>
          </TouchableOpacity>
          <View style={st.actionDivider} />
          <TouchableOpacity style={st.actionBtn} onPress={() => { onDelete(); setExpanded(false); }}>
            <Text style={[st.actionBtnTxt, { color: "#F44336" }]}>🗑️ Elimina</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ── FormLabel ──
function FormLabel({ children }) {
  return <Text style={st.formLabel}>{children}</Text>;
}

// ── STYLES ──
const GREEN = "#4CAF50";
const DARK_GREEN = "#388E3C";

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f5f5" },

  // Header
  header: { backgroundColor: GREEN, paddingTop: Platform.OS === "android" ? 12 : 48, paddingHorizontal: 16, paddingBottom: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  headerTitle: { flex: 1, color: "white", fontSize: 20, fontWeight: "800" },
  headerActions: { flexDirection: "row", gap: 4 },
  hBtn: { padding: 8 },
  hBtnTxt: { color: "white", fontSize: 20 },
  searchInput: { backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, color: "white", fontSize: 15, marginBottom: 10 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressBg: { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 3 },
  progressFill: { height: 6, backgroundColor: "white", borderRadius: 3 },
  progressLabel: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "700", minWidth: 32, textAlign: "right" },
  budgetRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  budgetLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  budgetValue: { color: "white", fontSize: 16, fontWeight: "800" },

  // Toolbar
  toolbar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#eee", gap: 6 },
  viewBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: "#eee" },
  viewBtnActive: { backgroundColor: GREEN },
  viewBtnTxt: { fontSize: 12, fontWeight: "700", color: "#555" },
  viewBtnTxtActive: { color: "white" },
  iconBtn: { padding: 6 },

  // Scroll
  scroll: { flex: 1 },
  empty: { alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyTxt: { color: "#bbb", fontSize: 15, marginTop: 12, textAlign: "center", lineHeight: 22 },

  // Category header
  catHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#fafafa", borderLeftWidth: 4, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  catHeaderTxt: { flex: 1, fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  catCount: { fontSize: 12, color: "#aaa" },

  // Item
  itemWrap: { backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  itemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13, paddingRight: 14, paddingLeft: 10, gap: 10 },
  catStrip: { width: 4, alignSelf: "stretch", borderRadius: 2 },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  checkmark: { color: "white", fontSize: 13, fontWeight: "700" },
  itemName: { fontSize: 15, fontWeight: "700", color: "#222", marginBottom: 2 },
  itemNameDone: { textDecorationLine: "line-through", color: "#bbb" },
  itemMeta: { fontSize: 12, color: "#999" },
  moreBtn: { padding: 6 },
  moreBtnTxt: { fontSize: 22, color: "#ccc" },

  // Action bar
  actionBar: { flexDirection: "row", backgroundColor: "#fafafa", borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  actionBtn: { flex: 1, paddingVertical: 10, alignItems: "center" },
  actionBtnTxt: { fontSize: 13, fontWeight: "700" },
  actionDivider: { width: 1, backgroundColor: "#eee" },

  // FAB
  fab: { position: "absolute", bottom: 28, right: 22, width: 58, height: 58, borderRadius: 29, backgroundColor: GREEN, alignItems: "center", justifyContent: "center", elevation: 8, shadowColor: GREEN, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  fabTxt: { color: "white", fontSize: 32, fontWeight: "300", marginTop: -2 },

  // Toast
  toast: { position: "absolute", bottom: 100, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.75)", paddingHorizontal: 20, paddingVertical: 9, borderRadius: 20 },
  toastTxt: { color: "white", fontSize: 13, fontWeight: "700" },

  // Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalSheet: { backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 18, paddingTop: 12, maxHeight: "90%" },
  modalHandle: { width: 40, height: 4, backgroundColor: "#ddd", borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#222", marginBottom: 16 },

  // Form
  formLabel: { fontSize: 12, fontWeight: "800", color: "#666", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: "#f5f5f5", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, borderWidth: 1.5, borderColor: "#e0e0e0", color: "#222" },
  unitChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: "#f0f0f0" },
  unitChipActive: { backgroundColor: GREEN },
  unitChipTxt: { fontSize: 13, fontWeight: "700", color: "#555" },

  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  catChip: { width: "22%", aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#f0f0f0", gap: 3 },
  catChipTxt: { fontSize: 10, fontWeight: "700", color: "#555", textAlign: "center" },

  saveBtn: { borderRadius: 12, paddingVertical: 15, alignItems: "center", marginTop: 20 },
  saveBtnTxt: { color: "white", fontSize: 15, fontWeight: "800" },
  cancelBtn: { borderRadius: 12, paddingVertical: 13, alignItems: "center", marginTop: 10, borderWidth: 1.5, borderColor: "#ddd" },
  cancelBtnTxt: { color: "#888", fontSize: 14, fontWeight: "700" },
});
