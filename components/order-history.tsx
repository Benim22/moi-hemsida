"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { 
  Search, 
  RefreshCw, 
  Filter, 
  Package, 
  CheckCircle, 
  Clock, 
  Truck, 
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  DollarSign,
  FileText,
  History,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  ShoppingCart,
  AlertCircle,
  Eye
} from "lucide-react"

interface OrderHistoryProps {
  isOpen: boolean
  onClose: () => void
}

interface OrderData {
  id: string
  order_number: string
  status: string
  total_price: number
  amount: number
  location: string
  created_at: string
  updated_at: string
  customer_name: string
  customer_email: string
  customer_phone: string
  phone: string
  delivery_type: string
  delivery_address: string
  notes: string
  special_instructions: string
  items: any
  profiles?: {
    name: string
    email: string
  }
}

export default function OrderHistory({ isOpen, onClose }: OrderHistoryProps) {
  const [allOrders, setAllOrders] = useState<OrderData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
  
  // Filtering states
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [sortBy, setSortBy] = useState('date_desc')
  const [dateFilter, setDateFilter] = useState('all')
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage] = useState(10) // 10 orders per page for better mobile experience
  
  // Stats
  const [orderStats, setOrderStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    preparing_orders: 0,
    ready_orders: 0,
    delivered_orders: 0,
    cancelled_orders: 0,
    total_revenue: 0
  })

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      let ordersQuery = supabase
        .from('orders')
        .select(`
          *,
          profiles (
            name,
            email
          )
        `)

      if (selectedLocation && selectedLocation !== 'all') {
        ordersQuery = ordersQuery.eq('location', selectedLocation)
      }

      const { data: orders, error } = await ordersQuery
        .order('created_at', { ascending: false })
        .limit(500) // Limit to prevent too much data

      if (error) {
        console.error('Error fetching orders:', error)
        return
      }

      const ordersData = orders || []
      setAllOrders(ordersData)

      // Calculate stats
      const stats = {
        total_orders: ordersData.length,
        pending_orders: ordersData.filter(o => o.status === 'pending').length,
        preparing_orders: ordersData.filter(o => o.status === 'preparing').length,
        ready_orders: ordersData.filter(o => o.status === 'ready').length,
        delivered_orders: ordersData.filter(o => o.status === 'delivered').length,
        cancelled_orders: ordersData.filter(o => o.status === 'cancelled').length,
        total_revenue: ordersData.reduce((sum, o) => sum + (parseFloat(o.total_price || o.amount || 0)), 0)
      }
      setOrderStats(stats)

    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredAndSortedOrders = () => {
    let filtered = allOrders

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date()
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at)
            return orderDate >= startOfToday
          })
          break
        case 'yesterday':
          const yesterday = new Date(startOfToday)
          yesterday.setDate(yesterday.getDate() - 1)
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at)
            return orderDate >= yesterday && orderDate < startOfToday
          })
          break
        case 'this_week':
          const startOfWeek = new Date(startOfToday)
          startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at)
            return orderDate >= startOfWeek
          })
          break
        case 'this_month':
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.created_at)
            return orderDate >= startOfMonth
          })
          break
      }
    }

    // Sorting
    switch (sortBy) {
      case 'date_desc':
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case 'date_asc':
        return filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      case 'amount_desc':
        return filtered.sort((a, b) => (parseFloat(b.total_price || b.amount || 0)) - (parseFloat(a.total_price || a.amount || 0)))
      case 'amount_asc':
        return filtered.sort((a, b) => (parseFloat(a.total_price || a.amount || 0)) - (parseFloat(b.total_price || b.amount || 0)))
      case 'status':
        return filtered.sort((a, b) => (a.status || '').localeCompare(b.status || ''))
      default:
        return filtered
    }
  }

  const filteredOrders = getFilteredAndSortedOrders()
  
  // Pagination calculations
  const totalOrders = filteredOrders.length
  const totalPages = Math.ceil(totalOrders / ordersPerPage)
  const startIndex = (currentPage - 1) * ordersPerPage
  const endIndex = startIndex + ordersPerPage
  const currentOrders = filteredOrders.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterStatus, selectedLocation, sortBy, dateFilter, searchTerm])

  useEffect(() => {
    if (isOpen) {
      fetchOrders()
    }
  }, [isOpen, selectedLocation])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'confirmed': return 'bg-blue-500'
      case 'preparing': return 'bg-orange-500'
      case 'ready': return 'bg-green-500'
      case 'delivered': return 'bg-gray-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />
      case 'confirmed': return <CheckCircle className="w-3 h-3" />
      case 'preparing': return <Package className="w-3 h-3" />
      case 'ready': return <CheckCircle className="w-3 h-3" />
      case 'delivered': return <Truck className="w-3 h-3" />
      case 'cancelled': return <AlertCircle className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Väntande'
      case 'confirmed': return 'Bekräftad'
      case 'preparing': return 'Tillagas'
      case 'ready': return 'Klar'
      case 'delivered': return 'Levererad'
      case 'cancelled': return 'Avbruten'
      default: return status
    }
  }

  const getLocationName = (location: string) => {
    switch (location) {
      case 'malmo': return 'Malmö'
      case 'trelleborg': return 'Trelleborg'
      case 'ystad': return 'Ystad'
      default: return location
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-black via-gray-900 to-black border border-[#e4d699]/30">
        <DialogHeader className="text-center pb-2 sm:pb-4">
          <DialogTitle className="text-lg sm:text-2xl font-bold text-white flex items-center justify-center gap-2">
            <History className="h-5 w-5 sm:h-6 sm:w-6 text-[#e4d699]" />
            <span className="hidden xs:inline">Alla Beställningar</span>
            <span className="xs:hidden">Beställningar</span>
          </DialogTitle>
          <p className="text-white/60 mt-1 sm:mt-2 text-sm sm:text-base">
            Visa och hantera alla beställningar från systemet
          </p>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Stats Overview */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-white text-center">Översikt</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
              <Card className="border border-[#e4d699]/30 bg-gradient-to-br from-[#e4d699]/20 to-yellow-600/20">
                <CardContent className="p-2 sm:p-3 text-center">
                  <div className="text-base sm:text-lg font-bold text-[#e4d699]">{orderStats.total_orders}</div>
                  <div className="text-xs text-white/80">Totalt</div>
                </CardContent>
              </Card>
              <Card className="border border-yellow-500/30 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20">
                <CardContent className="p-2 sm:p-3 text-center">
                  <div className="text-base sm:text-lg font-bold text-yellow-400">{orderStats.pending_orders}</div>
                  <div className="text-xs text-yellow-300">Väntande</div>
                </CardContent>
              </Card>
              <Card className="border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-orange-800/20">
                <CardContent className="p-2 sm:p-3 text-center">
                  <div className="text-base sm:text-lg font-bold text-orange-400">{orderStats.preparing_orders}</div>
                  <div className="text-xs text-orange-300">Tillagas</div>
                </CardContent>
              </Card>
              <Card className="border border-green-500/30 bg-gradient-to-br from-green-900/20 to-green-800/20">
                <CardContent className="p-2 sm:p-3 text-center">
                  <div className="text-base sm:text-lg font-bold text-green-400">{orderStats.ready_orders}</div>
                  <div className="text-xs text-green-300">Klara</div>
                </CardContent>
              </Card>
              <Card className="border border-gray-500/30 bg-gradient-to-br from-gray-900/20 to-gray-800/20">
                <CardContent className="p-2 sm:p-3 text-center">
                  <div className="text-base sm:text-lg font-bold text-gray-400">{orderStats.delivered_orders}</div>
                  <div className="text-xs text-gray-300">Levererade</div>
                </CardContent>
              </Card>
              <Card className="border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-purple-800/20 sm:col-span-3 lg:col-span-1">
                <CardContent className="p-2 sm:p-3 text-center">
                  <div className="text-sm sm:text-base lg:text-lg font-bold text-purple-400">{orderStats.total_revenue.toLocaleString('sv-SE')} kr</div>
                  <div className="text-xs text-purple-300">Totalt värde</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="border border-[#e4d699]/30 bg-gradient-to-br from-black/80 to-gray-900/80">
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
                  <Input
                    placeholder="Sök order, kund, e-post..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black/50 border-[#e4d699]/30 text-white placeholder:text-white/40 h-10 sm:h-auto"
                  />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-white/70 text-xs sm:text-sm">Status:</label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="bg-black/50 border-[#e4d699]/30 text-white h-9 sm:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-[#e4d699]/30">
                        <SelectItem value="all">Alla ({allOrders.length})</SelectItem>
                        <SelectItem value="pending">Väntande ({orderStats.pending_orders})</SelectItem>
                        <SelectItem value="preparing">Tillagas ({orderStats.preparing_orders})</SelectItem>
                        <SelectItem value="ready">Klara ({orderStats.ready_orders})</SelectItem>
                        <SelectItem value="delivered">Levererade ({orderStats.delivered_orders})</SelectItem>
                        <SelectItem value="cancelled">Avbrutna ({orderStats.cancelled_orders})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-white/70 text-xs sm:text-sm">Plats:</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="bg-black/50 border-[#e4d699]/30 text-white h-9 sm:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-[#e4d699]/30">
                        <SelectItem value="all">Alla platser</SelectItem>
                        <SelectItem value="malmo">Malmö</SelectItem>
                        <SelectItem value="trelleborg">Trelleborg</SelectItem>
                        <SelectItem value="ystad">Ystad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-white/70 text-xs sm:text-sm">Datum:</label>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="bg-black/50 border-[#e4d699]/30 text-white h-9 sm:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-[#e4d699]/30">
                        <SelectItem value="all">Alla datum</SelectItem>
                        <SelectItem value="today">Idag</SelectItem>
                        <SelectItem value="yesterday">Igår</SelectItem>
                        <SelectItem value="this_week">Denna vecka</SelectItem>
                        <SelectItem value="this_month">Denna månad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-white/70 text-xs sm:text-sm">Sortering:</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-black/50 border-[#e4d699]/30 text-white h-9 sm:h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-[#e4d699]/30">
                        <SelectItem value="date_desc">Senaste först</SelectItem>
                        <SelectItem value="date_asc">Äldsta först</SelectItem>
                        <SelectItem value="amount_desc">Högsta belopp</SelectItem>
                        <SelectItem value="amount_asc">Lägsta belopp</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Info and Refresh Button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                  <div className="text-xs sm:text-sm text-white/60">
                    Visar {currentOrders.length} av {totalOrders} filtrerade beställningar ({allOrders.length} totalt)
                  </div>
                  <Button 
                    onClick={fetchOrders} 
                    disabled={isLoading} 
                    variant="outline"
                    size="sm"
                    className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 h-8 sm:h-9"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
                    ) : (
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    )}
                    <span className="hidden xs:inline">Uppdatera</span>
                    <span className="xs:hidden">Uppdatera</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="space-y-3 sm:space-y-4">
            {totalOrders === 0 ? (
              <Card className="border border-[#e4d699]/30 bg-gradient-to-br from-black/80 to-gray-900/80">
                <CardContent className="p-6 sm:p-8 text-center">
                  <ShoppingCart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-white/40" />
                  <p className="text-white/60 text-sm sm:text-base">Inga beställningar att visa</p>
                </CardContent>
              </Card>
            ) : (
              currentOrders.map((order) => (
                <Card 
                  key={order.id} 
                  className="border border-[#e4d699]/30 bg-gradient-to-br from-black/80 to-gray-900/80 hover:border-[#e4d699]/50 transition-all duration-200"
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="space-y-3 sm:space-y-4">
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <Badge className={`${getStatusColor(order.status)} text-white font-medium px-2 py-1 flex items-center gap-1 text-xs sm:text-sm`}>
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </Badge>
                          <span className="font-mono text-sm sm:text-base text-white font-bold">#{order.order_number}</span>
                          <span className="text-xs sm:text-sm text-white/60 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {getLocationName(order.location)}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 h-8 sm:h-9 text-xs sm:text-sm"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden xs:inline">Visa detaljer</span>
                          <span className="xs:hidden">Detaljer</span>
                        </Button>
                      </div>

                      {/* Main Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-white/40 flex-shrink-0" />
                          <span className="text-white truncate">
                            {order.customer_name || order.profiles?.name || order.customer_email || 'Gäst'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-white/40 flex-shrink-0" />
                          <span className="text-white font-bold">
                            {parseFloat(order.total_price || order.amount || 0).toLocaleString('sv-SE')} kr
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white/40 flex-shrink-0" />
                          <span className="text-white/80 text-xs sm:text-sm">
                            {new Date(order.created_at).toLocaleDateString('sv-SE')} {new Date(order.created_at).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Additional Info - Compact for mobile */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                        {order.delivery_type && (
                          <div className="flex items-center gap-2">
                            <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-white/40 flex-shrink-0" />
                            <span className="text-white/80">
                              {order.delivery_type === 'delivery' ? 'Leverans' : 'Avhämtning'}
                            </span>
                          </div>
                        )}
                        {(order.customer_email || order.profiles?.email) && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-white/40 flex-shrink-0" />
                            <span className="text-white/80 truncate">
                              {order.customer_email || order.profiles?.email}
                            </span>
                          </div>
                        )}
                        {(order.customer_phone || order.phone) && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-white/40 flex-shrink-0" />
                            <span className="text-white/80">
                              {order.customer_phone || order.phone}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Address - Only on larger screens or when important */}
                      {order.delivery_address && (
                        <div className="text-xs sm:text-sm p-2 bg-white/5 rounded border border-white/10">
                          <span className="text-white/60">Leveransadress:</span>
                          <span className="text-white ml-2">{order.delivery_address}</span>
                        </div>
                      )}

                      {/* Notes - Compact */}
                      {order.notes && (
                        <div className="text-xs sm:text-sm p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                          <span className="text-blue-400 font-medium">Anteckningar:</span>
                          <div className="text-blue-300 mt-1">{order.notes}</div>
                        </div>
                      )}

                      {order.special_instructions && (
                        <div className="text-xs sm:text-sm p-2 bg-orange-500/10 border border-orange-500/30 rounded">
                          <span className="text-orange-400 font-medium">Speciella instruktioner:</span>
                          <div className="text-orange-300 mt-1">{order.special_instructions}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="border border-[#e4d699]/30 bg-gradient-to-br from-black/80 to-gray-900/80">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="text-xs sm:text-sm text-white/60 text-center">
                    Visar {startIndex + 1}-{Math.min(endIndex, totalOrders)} av {totalOrders} beställningar
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    {/* First and Previous - Only on larger screens */}
                    <div className="hidden sm:flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 h-8"
                      >
                        <ChevronsLeft className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 h-8"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Mobile Previous */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="sm:hidden border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 h-8"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(3, totalPages))].map((_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 2, currentPage - 1)) + i
                        if (pageNum > totalPages) return null
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className={currentPage === pageNum 
                              ? "bg-[#e4d699] text-black hover:bg-[#e4d699]/90 h-8 min-w-8" 
                              : "border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 h-8 min-w-8"
                            }
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    
                    {/* Mobile Next */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="sm:hidden border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 h-8"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                    
                    {/* Next and Last - Only on larger screens */}
                    <div className="hidden sm:flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 h-8"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 h-8"
                      >
                        <ChevronsRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Quick Jump for mobile */}
                  <div className="flex items-center justify-center gap-2 sm:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 h-7 text-xs"
                    >
                      Första
                    </Button>
                    <span className="text-xs text-white/60">
                      {currentPage} av {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="border-[#e4d699]/30 text-[#e4d699] hover:bg-[#e4d699]/10 h-7 text-xs"
                    >
                      Sista
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-black via-gray-900 to-black border border-[#e4d699]/30">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#e4d699]" />
                  Orderdetaljer - #{selectedOrder.order_number}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Order Status and Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border border-[#e4d699]/30 bg-gradient-to-br from-black/80 to-gray-900/80">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Orderstatus</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className={`${getStatusColor(selectedOrder.status)} text-white font-medium px-3 py-1 flex items-center gap-1 w-fit`}>
                        {getStatusIcon(selectedOrder.status)}
                        {getStatusText(selectedOrder.status)}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border border-[#e4d699]/30 bg-gradient-to-br from-black/80 to-gray-900/80">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Orderinformation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Ordernummer:</span>
                        <span className="text-white font-mono">#{selectedOrder.order_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Totalt:</span>
                        <span className="text-white font-bold">{parseFloat(selectedOrder.total_price || selectedOrder.amount || 0).toLocaleString('sv-SE')} kr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Plats:</span>
                        <span className="text-white">{getLocationName(selectedOrder.location)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Beställd:</span>
                        <span className="text-white">{new Date(selectedOrder.created_at).toLocaleString('sv-SE')}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Customer Information */}
                <Card className="border border-[#e4d699]/30 bg-gradient-to-br from-black/80 to-gray-900/80">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Kundinformation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-white/60">Namn:</span>
                        <span className="text-white">{selectedOrder.customer_name || selectedOrder.profiles?.name || 'Ej angivet'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">E-post:</span>
                        <span className="text-white">{selectedOrder.customer_email || selectedOrder.profiles?.email || 'Ej angivet'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Telefon:</span>
                        <span className="text-white">{selectedOrder.customer_phone || selectedOrder.phone || 'Ej angivet'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Typ:</span>
                        <span className="text-white">{selectedOrder.delivery_type === 'delivery' ? 'Leverans' : 'Avhämtning'}</span>
                      </div>
                    </div>
                    {selectedOrder.delivery_address && (
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex justify-between">
                          <span className="text-white/60">Leveransadress:</span>
                          <span className="text-white">{selectedOrder.delivery_address}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Items */}
                {selectedOrder.items && (
                  <Card className="border border-[#e4d699]/30 bg-gradient-to-br from-black/80 to-gray-900/80">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Beställda varor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-black/30 rounded-lg p-3 border border-[#e4d699]/20 font-mono text-sm">
                        {(() => {
                          // Parse order items
                          let orderItems = []
                          
                          try {
                            orderItems = typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : selectedOrder.items
                          } catch (e) {
                            console.error('Error parsing order items:', e)
                            return (
                              <div className="text-red-400 text-xs">
                                ⚠️ Fel vid parsing av beställning
                              </div>
                            )
                          }

                          if (!orderItems || orderItems.length === 0) {
                            return (
                              <div className="text-white/50 text-xs italic">
                                ⚠️ Ingen detaljerad information tillgänglig
                              </div>
                            )
                          }

                          // Group identical items
                          const groupedItems = orderItems.reduce((acc, item) => {
                            const optionsKey = item.options ? JSON.stringify(item.options) : 'no-options'
                            const extrasKey = item.extras ? JSON.stringify(item.extras) : 'no-extras'
                            const key = `${item.name}-${optionsKey}-${extrasKey}`
                            
                            if (acc[key]) {
                              acc[key].quantity += item.quantity
                              acc[key].totalPrice += (item.price * item.quantity)
                            } else {
                              acc[key] = {
                                ...item,
                                totalPrice: item.price * item.quantity
                              }
                            }
                            
                            return acc
                          }, {})

                          const groupedItemsArray = Object.values(groupedItems)
                          let orderTotal = 0

                          return (
                            <div className="space-y-3">
                              {/* Receipt Header */}
                              <div className="text-center border-b border-[#e4d699]/30 pb-2">
                                <div className="text-[#e4d699] font-bold">MOI SUSHI & POKÉ BOWL</div>
                                <div className="text-white/70 text-xs">KVITTO - BESTÄLLNING #{selectedOrder.id}</div>
                              </div>

                              {/* Order Items */}
                              {groupedItemsArray.map((item, index) => {
                                const itemTotal = item.totalPrice || (item.price * item.quantity)
                                orderTotal += itemTotal
                                
                                return (
                                  <div key={index} className="space-y-1">
                                    {/* Main item */}
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="text-white font-medium">
                                          {item.quantity}x {item.name}
                                        </div>
                                        <div className="text-white/60 text-xs">
                                          {item.price} kr/st
                                        </div>
                                      </div>
                                      <div className="text-white font-medium min-w-[60px] text-right">
                                        {itemTotal} kr
                                      </div>
                                    </div>

                                    {/* Options */}
                                    {item.options && Object.entries(item.options).map(([key, value]) => (
                                      <div key={key} className="ml-4 text-white/70 text-xs">
                                        • {key}: {value}
                                      </div>
                                    ))}

                                    {/* Extras */}
                                    {item.extras && item.extras.map((extra, extraIndex) => (
                                      <div key={extraIndex} className="ml-4 text-white/70 text-xs flex justify-between">
                                        <span>+ {extra.name}</span>
                                        <span>+{extra.price} kr</span>
                                      </div>
                                    ))}

                                    {/* Separator */}
                                    {index < groupedItemsArray.length - 1 && (
                                      <div className="border-b border-white/10 pt-1"></div>
                                    )}
                                  </div>
                                )
                              })}

                              {/* Total */}
                              <div className="border-t border-[#e4d699]/30 pt-2">
                                <div className="flex justify-between items-center">
                                  <div className="text-[#e4d699] font-bold">TOTALT:</div>
                                  <div className="text-[#e4d699] font-bold text-lg">
                                    {orderTotal} kr
                                  </div>
                                </div>
                              </div>

                              {/* Receipt Footer */}
                              <div className="text-center border-t border-[#e4d699]/30 pt-2">
                                <div className="text-white/50 text-xs">
                                  Beställd: {new Date(selectedOrder.created_at).toLocaleString('sv-SE')}
                                </div>
                                <div className="text-white/50 text-xs">
                                  Status: {selectedOrder.status}
                                </div>
                                {selectedOrder.location && (
                                  <div className="text-white/50 text-xs">
                                    Plats: {selectedOrder.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                {(selectedOrder.notes || selectedOrder.special_instructions) && (
                  <div className="space-y-4">
                    {selectedOrder.notes && (
                      <Card className="border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-blue-800/20">
                        <CardHeader>
                          <CardTitle className="text-blue-400 text-sm">Anteckningar</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-blue-300 text-sm">{selectedOrder.notes}</p>
                        </CardContent>
                      </Card>
                    )}

                    {selectedOrder.special_instructions && (
                      <Card className="border border-orange-500/30 bg-gradient-to-br from-orange-900/20 to-orange-800/20">
                        <CardHeader>
                          <CardTitle className="text-orange-400 text-sm">Speciella instruktioner</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-orange-300 text-sm">{selectedOrder.special_instructions}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  )
} 