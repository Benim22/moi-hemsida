# 🔍 MCP ÖVERVAKNING & TESTPLAN FÖR RLS

## 📊 REAL-TIME MONITORING UNDER IMPLEMENTATION

### 🚨 **KRITISKA INDIKATORER ATT ÖVERVAKA**

#### **1. APP-FUNKTIONALITET**
```bash
# Testa dessa funktioner efter varje tabell:
✅ Användare kan logga in
✅ Meny visas korrekt
✅ Beställningar kan skapas
✅ Admin-panel laddas
✅ Platsväljare fungerar
✅ Notifikationer visas
```

#### **2. DATABAS-PRESTANDA**
```sql
-- Övervaka långsamma queries
SELECT 
    query,
    mean_exec_time,
    calls,
    total_exec_time
FROM pg_stat_statements 
WHERE mean_exec_time > 1000 -- Över 1 sekund
ORDER BY mean_exec_time DESC;
```

#### **3. RLS POLICY COVERAGE**
```sql
-- Kontrollera att alla tabeller har policies
SELECT 
    t.tablename,
    t.rowsecurity as rls_enabled,
    COUNT(p.policyname) as policy_count,
    CASE 
        WHEN t.rowsecurity = false THEN '🔴 NO RLS'
        WHEN COUNT(p.policyname) = 0 THEN '🟡 RLS BUT NO POLICIES'
        ELSE '✅ PROTECTED'
    END as status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
AND t.tablename IN ('profiles', 'orders', 'menu_items', 'notifications', 'locations')
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;
```

---

## 🧪 **STEG-FÖR-STEG TESTPROTOKOLL**

### **FÖRE VARJE TABELL-IMPLEMENTATION:**

#### **🔍 PRE-FLIGHT CHECKLIST**
- [ ] **Backup:** Dokumentera nuvarande policies
- [ ] **App Status:** Kontrollera att appen fungerar normalt
- [ ] **User Count:** Räkna aktiva användare
- [ ] **Error Baseline:** Notera nuvarande error rate

```sql
-- Spara nuvarande status
CREATE TEMP TABLE rls_backup_status AS
SELECT 
    tablename,
    rowsecurity,
    COUNT(policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE schemaname = 'public'
GROUP BY tablename, rowsecurity;
```

### **UNDER IMPLEMENTATION:**

#### **🔄 LIVE MONITORING**
```sql
-- Kör detta var 30:e sekund under implementation
SELECT 
    NOW() as check_time,
    'LIVE MONITOR' as status,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle in transaction') as idle_in_transaction,
    (SELECT COUNT(*) FROM pg_locks WHERE NOT granted) as blocked_queries;
```

### **EFTER VARJE TABELL:**

#### **🧪 FUNKTIONALITETSTEST**
```javascript
// Test-script för app-funktionalitet
const testAppFunctionality = async () => {
    const tests = [
        { name: 'Login', url: '/auth/login', expected: 200 },
        { name: 'Menu', url: '/menu', expected: 200 },
        { name: 'Profile', url: '/profile', expected: 200 },
        { name: 'Admin', url: '/admin', expected: 200 },
        { name: 'Locations', url: '/locations', expected: 200 }
    ];
    
    for (const test of tests) {
        try {
            const response = await fetch(test.url);
            console.log(`${test.name}: ${response.status === test.expected ? '✅' : '❌'}`);
        } catch (error) {
            console.log(`${test.name}: ❌ ERROR - ${error.message}`);
        }
    }
};
```

---

## 🚨 **AUTOMATISKA ROLLBACK TRIGGERS**

### **KRITISKA FEL SOM UTLÖSER ROLLBACK:**

#### **1. PERMISSION DENIED ERRORS**
```sql
-- Om denna query ger fel = ROLLBACK
SELECT 'TEST' as test, COUNT(*) FROM {table_name};
```

#### **2. APP CRASH INDICATORS**
- 🔴 **HTTP 500 errors** ökar med >50%
- 🔴 **Login failure rate** ökar med >25%
- 🔴 **Database connections** når max limit
- 🔴 **Query timeout** på kritiska endpoints

#### **3. PRESTANDA DEGRADATION**
```sql
-- Om queries tar >5x längre tid = ROLLBACK
SELECT 
    query,
    mean_exec_time,
    CASE 
        WHEN mean_exec_time > 5000 THEN 'ROLLBACK NEEDED'
        ELSE 'OK'
    END as status
FROM pg_stat_statements 
WHERE query ILIKE '%{table_name}%';
```

---

## 🔧 **AUTOMATISKA ROLLBACK SCRIPTS**

### **EMERGENCY ROLLBACK FÖR ALLA TABELLER**
```sql
-- NÖDLÄGE: Återställ alla tabeller
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'orders', 'menu_items', 'notifications', 'locations')
    LOOP
        -- Ta bort alla policies
        EXECUTE format('DROP POLICY IF EXISTS "Users can view own %s" ON %s', table_record.tablename, table_record.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Admins can manage %s" ON %s', table_record.tablename, table_record.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Public can view all %s" ON %s', table_record.tablename, table_record.tablename);
        
        -- Inaktivera RLS
        EXECUTE format('ALTER TABLE %s DISABLE ROW LEVEL SECURITY', table_record.tablename);
        
        RAISE NOTICE 'Rolled back RLS for table: %', table_record.tablename;
    END LOOP;
END $$;
```

---

## 📈 **SUCCESS METRICS**

### **EFTER FULLSTÄNDIG IMPLEMENTATION:**

#### **🎯 SÄKERHETSMÅL**
- ✅ **100% RLS Coverage** på kritiska tabeller
- ✅ **0 Permission Denied** errors för legitima queries
- ✅ **<5% Performance Impact** på query-tider
- ✅ **Alla App-funktioner** fungerar normalt

#### **📊 MONITORING DASHBOARD**
```sql
-- Daglig säkerhetsrapport
CREATE OR REPLACE VIEW daily_rls_security_report AS
SELECT 
    CURRENT_DATE as report_date,
    COUNT(*) FILTER (WHERE rowsecurity = true) as tables_with_rls,
    COUNT(*) FILTER (WHERE rowsecurity = false) as tables_without_rls,
    SUM(policy_count) as total_policies,
    CASE 
        WHEN COUNT(*) FILTER (WHERE rowsecurity = false) = 0 THEN '✅ FULLY SECURED'
        ELSE '⚠️ INCOMPLETE'
    END as security_status
FROM (
    SELECT 
        t.tablename,
        t.rowsecurity,
        COUNT(p.policyname) as policy_count
    FROM pg_tables t
    LEFT JOIN pg_policies p ON t.tablename = p.tablename
    WHERE t.schemaname = 'public'
    GROUP BY t.tablename, t.rowsecurity
) subquery;
```

---

## 🎮 **IMPLEMENTATION KOMMANDO**

**Är du redo att börja med den säkraste approachen?**

### **ALTERNATIV:**

1. **🟢 BÖRJA MED LOCATIONS** (lägst risk, bäst för att testa processen)
   ```bash
   # Kör: mcp_step1_locations_safe_rls.sql
   # Testa: App-funktionalitet
   # Övervaka: 30 minuter
   ```

2. **🔍 ANALYSERA FÖRST** (kör alla analyser innan implementation)
   ```bash
   # Kör: mcp_critical_tables_analysis.sql
   # Granska: Resultat och risker
   # Planera: Detaljerad implementation
   ```

3. **🛡️ FULL SÄKERHETSMODE** (komplett backup och staging test först)
   ```bash
   # Skapa: Databas-backup
   # Klona: Till staging-miljö
   # Testa: Hela processen på staging
   ```

**Vilket alternativ väljer du för att garantera att appen INTE går sönder?** 