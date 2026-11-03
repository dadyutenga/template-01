import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, UserPlus, Share2, Clock, Bell, CheckCheck, Trash2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import notificationService, { NotificationData, NotificationType } from "@/services/notificationService";

const Notifications = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | NotificationType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);

    // Build params according to API: is_read can be 'true', 'false', or 'all'
    const params: {
      is_read?: 'true' | 'false' | 'all';
      type?: NotificationType;
      page?: number;
      page_size?: number;
    } = {};
    
    // Set is_read filter
    if (activeTab === 'unread') {
      params.is_read = 'false';
    } else if (activeTab === 'all') {
      params.is_read = 'all'; // Get all notifications regardless of read status
    } else {
      // For type-specific tabs, get all (both read and unread)
      params.is_read = 'all';
    }
    
    // Set type filter for specific notification types
    if (
      activeTab === 'share_request' ||
      activeTab === 'share_accepted' ||
      activeTab === 'share_rejected' ||
      activeTab === 'friend_request' ||
      activeTab === 'friend_accepted' ||
      activeTab === 'upload_created' ||
      activeTab === 'class_joined'
    ) {
      params.type = activeTab;
    }

    try {
      console.log('🔵 Notifications page - Fetching with params:', params);
      const response = await notificationService.listNotifications(params);
      console.log('🟢 Notifications page - Response:', response);
      
      setNotifications(response.results || []);
      setUnreadCount(response.unread_count ?? 0);
    } catch (error: any) {
      console.error('🔴 Failed to fetch notifications:', error);
      console.error('🔴 Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      toast({
        title: t("notificationsToastLoadFailTitle") || "Failed to Load Notifications",
        description: error.response?.data?.message || error.response?.data?.detail || t("notificationsToastLoadFailDesc") || "Could not load notifications. Please try again.",
        variant: "destructive",
      });
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, t]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, activeTab, fetchNotifications]);

  // Poll unread count (fast badge). If it increases, refresh the list.
  useEffect(() => {
    if (!user) return;

    let mounted = true;
    let lastUnread = unreadCount;

    const poll = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        if (!mounted) return;
        setUnreadCount(count);
        if (count > lastUnread) {
          // Refresh list quietly if new notifications arrived.
          fetchNotifications(false);
        }
        lastUnread = count;
      } catch {
        // silent for polling
      }
    };

    const interval = setInterval(poll, 20000); // 20 seconds
    const onFocus = () => void poll();
    window.addEventListener("focus", onFocus);

    void poll();

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, fetchNotifications]);

  // Manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications(false);
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      console.log('🔵 Marking notification as read:', notificationId);
      const response = await notificationService.markAsRead(notificationId);
      console.log('🟢 Mark as read successful:', response);
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
      
      toast({
        title: t("notificationsToastMarkedTitle") || "Marked as Read",
        description: t("notificationsToastMarkedDesc") || "Notification marked as read.",
      });
    } catch (error: any) {
      console.error('🔴 Failed to mark as read:', error);
      console.error('🔴 Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      toast({
        title: t("notificationsToastMarkFailTitle") || "Failed to Mark as Read",
        description: error.response?.data?.message || error.response?.data?.detail || t("notificationsToastMarkFailDesc") || "Could not mark notification as read.",
        variant: "destructive",
      });
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      console.log('🔵 Marking all notifications as read');
      const response = await notificationService.markAllAsRead();
      console.log('🟢 Mark all as read successful:', response);
      
      // Update local state
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      
      const markCount = response?.marked_read ?? 0;
      toast({
        title: t("notificationsToastMarkAllTitle") || "All Marked as Read",
        description: (t("notificationsToastMarkAllDesc") || "Marked {count} notification(s) as read").replace("{count}", String(markCount)),
      });
    } catch (error: any) {
      console.error('🔴 Failed to mark all as read:', error);
      console.error('🔴 Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      toast({
        title: t("notificationsToastMarkAllFailTitle") || "Failed to Mark All as Read",
        description: error.response?.data?.message || error.response?.data?.detail || t("notificationsToastMarkAllFailDesc") || "Could not mark all notifications as read.",
        variant: "destructive",
      });
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: number) => {
    try {
      console.log('🔵 Deleting notification:', notificationId);
      await notificationService.deleteNotification(notificationId);
      console.log('🟢 Delete notification successful');
      
      // Update local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      
      if (notification && !notification.is_read) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
      
      toast({
        title: t("notificationsToastDeleteTitle") || "Notification Deleted",
        description: t("notificationsToastDeleteDesc") || "Notification has been deleted.",
      });
    } catch (error: any) {
      console.error('🔴 Failed to delete notification:', error);
      console.error('🔴 Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      toast({
        title: t("notificationsToastDeleteFailTitle") || "Failed to Delete",
        description: error.response?.data?.message || error.response?.data?.detail || t("notificationsToastDeleteFailDesc") || "Could not delete notification.",
        variant: "destructive",
      });
    }
  };

  const typeLabels: Record<NotificationType, string> = {
    share_request: t("notificationsTypeShare") || "Share",
    share_accepted: t("notificationsTypeShare") || "Share",
    share_rejected: t("notificationsTypeShare") || "Share",
    friend_request: t("notificationsTypeFriend") || "Friend",
    friend_accepted: t("notificationsTypeFriend") || "Friend",
    upload_created: t("notificationsTypeFile") || "Upload",
    class_joined: t("notificationsTypeFriend") || "Class",
  };

  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType | string) => {
    switch (type) {
      case 'share_request':
      case 'share_accepted':
      case 'share_rejected':
        return <Share2 className="h-5 w-5 text-blue-500" />;
      case 'friend_request':
      case 'friend_accepted':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'upload_created':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'class_joined':
        return <UserPlus className="h-5 w-5 text-cyan-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleOpenNotification = async (notification: NotificationData) => {
    // Mark as read in the background; keep navigation snappy.
    if (!notification.is_read) {
      void handleMarkAsRead(notification.id);
    }

    const relatedId = notification.related_object_id;

    if (notification.notification_type.startsWith("share_") || notification.notification_type === "share_request") {
      navigate("/sharing");
      return;
    }
    if (notification.notification_type.startsWith("friend_") || notification.notification_type === "friend_request") {
      navigate("/friends");
      return;
    }
    if (notification.notification_type === "upload_created") {
      navigate("/files");
      return;
    }
    if (notification.notification_type === "class_joined" && relatedId) {
      navigate(`/classes/${relatedId}`);
      return;
    }
  };

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Filter notifications based on active tab
  const filteredNotifications = notifications;

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardNav userRole={user?.user_type || "student"} userName={user?.full_name || user?.email || "User"} />
      
      <main className="container py-4 md:py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                  <Bell className="h-6 w-6 md:h-8 md:w-8" />
                  {t("notificationsPageTitle")}
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
                  )}
                </h1>
                <p className="text-muted-foreground">{t("notificationsPageDescription")}</p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {t("notificationsRefresh")}
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                  >
                    <CheckCheck className="h-4 w-4 mr-2" />
                    {t("notificationsMarkAll")}
                  </Button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
              <TabsList className="flex w-full gap-1 overflow-x-auto sm:grid sm:grid-cols-5 sm:overflow-visible">
                <TabsTrigger value="all" className="flex-1 whitespace-nowrap">
                  {t("notificationsTabAll")}
                </TabsTrigger>
                <TabsTrigger value="unread" className="flex-1 whitespace-nowrap">
                  {t("notificationsTabUnread")}
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="share_request" className="flex-1 whitespace-nowrap">
                  <Share2 className="h-4 w-4 mr-1" />
                  {t("notificationsTabShares")}
                </TabsTrigger>
                <TabsTrigger value="friend_request" className="flex-1 whitespace-nowrap">
                  <UserPlus className="h-4 w-4 mr-1" />
                  {t("notificationsTabFriends")}
                </TabsTrigger>
                <TabsTrigger value="upload_created" className="flex-1 whitespace-nowrap">
                  <FileText className="h-4 w-4 mr-1" />
                  {t("notificationsTabFiles")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">{t("notificationsEmptyTitle")}</h3>
                    <p className="text-muted-foreground">
                      {activeTab === 'unread' 
                        ? t("notificationsEmptyDescUnread")
                        : t("notificationsEmptyDescDefault")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                      <Card 
                        key={notification.id}
                        className={`transition-all ${!notification.is_read ? 'border-l-4 border-l-primary bg-primary/5' : ''}`}
                        onClick={() => handleOpenNotification(notification)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              {/* Icon */}
                              <div className="mt-1">
                                {getNotificationIcon(notification.notification_type)}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''}`}>
                                  {notification.content}
                                </p>
                                
                                {/* Time */}
                                <div className="flex items-center gap-2 mt-2">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {getRelativeTime(notification.created_at)}
                                  </span>
                                  
                                  {/* Type badge */}
                                  <Badge variant="outline" className="text-xs">
                                    {typeLabels[notification.notification_type as NotificationType] || notification.notification_type.replace('_', ' ')}
                                  </Badge>
                                  
                                  {/* Unread indicator */}
                                  {!notification.is_read && (
                                    <Badge variant="default" className="text-xs">
                                      {t("notificationsNewBadge")}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              {!notification.is_read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  title={t("notificationsMarkAsReadTitle")}
                                >
                                  <CheckCheck className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNotification(notification.id)}
                                title={t("notificationsDeleteTitle")}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Real-time indicator */}
            <div className="text-center text-xs text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>{t("notificationsAutoRefresh")}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Notifications;
