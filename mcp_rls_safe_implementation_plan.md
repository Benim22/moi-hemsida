# 🔒 MCP-BASERAD SÄKER RLS-IMPLEMENTATIONSPLAN

## 📊 IDENTIFIERADE TABELLER I APPLIKATIONEN

### 🔴 **KRITISKA TABELLER** (Applikationen slutar fungera utan dessa)
1. **`profiles`** - Användardata (REDAN DELVIS SÄKRAD)
2. **`orders`** - Beställningar (MEST KRITISK)
3. **`menu_items`** - Meny/produkter
4. **`notifications`** - Användarnotiser
5. **`locations`** - Platsinformation

### 🟡 **VIKTIGA TABELLER** (Funktionalitet påverkas)
6. **`bookings`** - Bordsbokningar
7. **`email_templates`** - E-postmallar (REDAN SÄKRAD)
8. **`email_settings`** - E-postinställningar
9. **`reward_programs`** - Belöningsprogram

### 🟢 **ANALYTICS TABELLER** (Rapporter påverkas)
10. **`analytics_sessions`** - Sessionsdata
11. **`analytics_page_views`** - Sidvisningar
12. **`analytics_menu_interactions`** - Menyinteraktioner
13. **`analytics_daily_stats`** - Daglig statistik

### 🔵 **SEO & STÖD TABELLER** (Mindre kritiska)
14. **`seo_pages`** - SEO-siddata
15. **`seo_global_settings`** - Globala SEO-inställningar
16. **`seo_keywords`** - SEO-nyckelord

---

## 🛡️ **SÄKER IMPLEMENTATIONSSTRATEGI**

### **PRINCIP: ZERO DOWNTIME APPROACH**

#### **🔧 STEG 1: FÖRBEREDELSE**
- ✅ Skapa backup av alla policies
- ✅ Testa RLS på KOPIA av databasen först
- ✅ Identifiera alla app-queries som påverkas
- ✅ Förbered rollback-scripts för varje tabell

#### **🔧 STEG 2: GRADVIS AKTIVERING**
- ✅ Aktivera RLS på EN tabell i taget
- ✅ Testa applikationen efter varje tabell
- ✅ Övervaka fel och prestanda
- ✅ Rollback omedelbart vid problem

#### **🔧 STEG 3: SÄKER ORDNING**
1. **Börja med minst kritiska** (seo_*, analytics_*)
2. **Fortsätt med stödtabeller** (locations, email_settings)
3. **Sedan viktiga tabeller** (bookings, notifications)
4. **Slutligen kritiska** (orders, menu_items)

---

## 🎯 **DETALJERAD IMPLEMENTATIONSPLAN**

### **GRUPP 1: SEO & ANALYTICS (LÅGRISK)**
```sql
-- Dessa tabeller påverkar inte kärnfunktionalitet
-- Säkert att börja med
TABLES: seo_pages, seo_global_settings, seo_keywords, analytics_*
RISK: ⚪ MINIMAL
ROLLBACK: Enkel
```

### **GRUPP 2: STÖDTABELLER (MEDIUMRISK)**
```sql
-- Påverkar funktionalitet men inte kritiska
TABLES: locations, email_settings, reward_programs
RISK: 🟡 MEDIUM
ROLLBACK: Måttlig komplexitet
```

### **GRUPP 3: ANVÄNDARDATA (HÖGRISK)**
```sql
-- Påverkar användarupplevelse direkt
TABLES: notifications, bookings
RISK: 🟠 HÖG
ROLLBACK: Komplex
```

### **GRUPP 4: KÄRNFUNKTIONALITET (KRITISK RISK)**
```sql
-- Applikationen slutar fungera utan dessa
TABLES: orders, menu_items
RISK: 🔴 KRITISK
ROLLBACK: Mycket komplex
```

---

## 🧪 **TESTPROTOKOLL PER TABELL**

### **PRE-IMPLEMENTATION CHECKLIST:**
- [ ] Backup av nuvarande policies
- [ ] Identifiera alla queries som använder tabellen
- [ ] Skapa test-queries för alla användarroller
- [ ] Förbered rollback-script
- [ ] Testa på staging/kopia först

### **POST-IMPLEMENTATION CHECKLIST:**
- [ ] Testa alla app-funktioner som använder tabellen
- [ ] Kontrollera att inga 403/permission errors uppstår
- [ ] Verifiera prestanda (inga långsamma queries)
- [ ] Testa med olika användarroller
- [ ] Övervaka error logs i 24h

---

## 🚀 **IMPLEMENTATION SCRIPTS**

### **SCRIPT 1: SÄKER RLS AKTIVERING**
```sql
-- Template för säker aktivering
BEGIN;

-- 1. Aktivera RLS utan policies (blockerar allt)
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- 2. Skapa policies steg för steg
CREATE POLICY "Admin access" ON {table_name} FOR ALL 
USING (is_admin());

-- 3. Testa policies
SELECT COUNT(*) FROM {table_name}; -- Ska fungera som admin

-- 4. Lägg till användar-policies
CREATE POLICY "User access" ON {table_name} FOR SELECT
USING (user_specific_condition);

-- 5. Testa igen
-- Om OK: COMMIT
-- Om fel: ROLLBACK
```

### **SCRIPT 2: SNABB ROLLBACK**
```sql
-- Emergency rollback template
BEGIN;
DROP POLICY IF EXISTS "policy_name" ON {table_name};
ALTER TABLE {table_name} DISABLE ROW LEVEL SECURITY;
COMMIT;
```

---

## 📱 **APP-KOMPATIBILITET MATRIX**

### **QUERIES SOM MÅSTE FUNGERA:**
| Tabell | Kritiska Queries | Användarroller |
|--------|------------------|----------------|
| `profiles` | SELECT own profile | user, admin |
| `orders` | SELECT own orders | user, admin, location-admin |
| `menu_items` | SELECT all items | public, user, admin |
| `notifications` | SELECT own notifications | user, admin |
| `locations` | SELECT all locations | public, user, admin |

### **ROLLBACK TRIGGERS:**
- ❌ 403 Permission Denied errors
- ❌ App crashes eller white screens
- ❌ Queries tar >5 sekunder
- ❌ Användare kan inte logga in
- ❌ Orders kan inte skapas

---

## 🎮 **STARTKOMMANDO**

**Vill du börja med:**

1. **🟢 SÄKER START** - Börja med SEO/Analytics tabeller (låg risk)
2. **🟡 MEDIUM START** - Börja med stödtabeller (locations, email_settings)
3. **🔴 DIREKT TILL KRITISK** - Börja med orders (hög risk, men mest viktigt)

**Välj alternativ så skapar jag detaljerade scripts för den gruppen!** 