import { useState, useEffect } from "react";
import DashboardNav from "@/components/layout/DashboardNav";
import BottomNav from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  UserPlus,
  UserCheck,
  UserX,
  Loader2,
  Users,
  Clock,
  Check,
  X,
  Edit2,
  Info,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import friendsService, { UserInfo, FriendInfo, FriendRequestDetail } from "@/services/friendsService";

const Friends = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Friends lists
  const [friends, setFriends] = useState<FriendInfo[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequestDetail[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestDetail[]>([]);
  const [searchResults, setSearchResults] = useState<UserInfo[]>([]);
  
  // Loading states
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  
  // Nickname dialog
  const [nicknameDialogOpen, setNicknameDialogOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendInfo | null>(null);
  const [nicknameInput, setNicknameInput] = useState("");
  const [isUpdatingNickname, setIsUpdatingNickname] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchFriends();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "requests") {
      fetchPendingRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const fetchFriends = async () => {
    setIsLoadingFriends(true);
    try {
      const response = await friendsService.getFriends("accepted");
      console.log("Friends API response:", response);
      
      // Response structure: { count, next, previous, results }
      if (response && Array.isArray(response.results)) {
        setFriends(response.results);
      } else {
        console.error("Unexpected response structure:", response);
        setFriends([]);
      }
    } catch (error: any) {
      console.error("Failed to fetch friends:", error);
      console.error("Error response:", error.response);
      toast({
        title: t("friendsLoadError"),
        description: t("friendsLoadErrorDesc"),
        variant: "destructive",
      });
      setFriends([]);
    } finally {
      setIsLoadingFriends(false);
    }
  };

  const fetchPendingRequests = async () => {
    setIsLoadingRequests(true);
    try {
      // Fetch incoming and sent requests separately using the correct endpoints
      const [incomingResponse, sentResponse] = await Promise.all([
        friendsService.getIncomingRequests(),
        friendsService.getSentRequests()
      ]);
      
      console.log("🔵 Incoming requests response:", incomingResponse);
      console.log("🔵 Sent requests response:", sentResponse);
      
      // Extract data arrays - the service already extracts from results
      const incomingRequests = incomingResponse?.data || [];
      const sentRequestsList = sentResponse?.data || [];
      
      console.log("🟢 Incoming requests (extracted):", incomingRequests);
      console.log("🟢 Incoming requests type:", typeof incomingRequests, Array.isArray(incomingRequests));
      console.log("🟢 Incoming requests length:", incomingRequests?.length);
      console.log("🟢 Sent requests (extracted):", sentRequestsList);
      console.log("🟢 Sent requests type:", typeof sentRequestsList, Array.isArray(sentRequestsList));
      console.log("🟢 Sent requests length:", sentRequestsList?.length);
      
      // Ensure we have arrays
      const incomingArray = Array.isArray(incomingRequests) ? incomingRequests : [];
      const sentArray = Array.isArray(sentRequestsList) ? sentRequestsList : [];
      
      console.log("📦 Setting pending requests:", incomingArray);
      console.log("📦 Setting sent requests:", sentArray);
      
      setPendingRequests(incomingArray);
      setSentRequests(sentArray);
    } catch (error: any) {
      console.error("🔴 Failed to fetch pending requests:", error);
      console.error("🔴 Error response:", error.response);
      toast({
        title: t("friendsLoadError"),
        description: error.response?.data?.message || t("friendsLoadRequestsError"),
        variant: "destructive",
      });
      setPendingRequests([]);
      setSentRequests([]);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    
    setIsSearching(true);
    try {
      const response = await friendsService.searchUsers(searchQuery);
      setSearchResults(response.data || []);
    } catch (error: any) {
      console.error("Search failed:", error);
      toast({
        title: t("friendsSearchFailed"),
        description: error.response?.data?.message || t("friendsSearchFailedDesc"),
        variant: "destructive",
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (userId: number) => {
    console.log('🔵 handleSendRequest called with userId:', userId, 'type:', typeof userId);
    setProcessingIds(prev => new Set(prev).add(userId));
    try {
      const result = await friendsService.sendFriendRequest(userId);
      console.log('🟢 Friend request sent successfully:', result);
      toast({
        title: t("friendsRequestSent"),
        description: t("friendsRequestSentDesc"),
      });
      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.id !== userId));
    } catch (error: any) {
      console.error("🔴 Failed to send request:", error);
      console.error("🔴 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast({
        title: t("friendsRequestFailed"),
        description: error.response?.data?.message || error.response?.data?.detail || t("friendsRequestFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleAcceptRequest = async (friendshipId: number) => {
    setProcessingIds(prev => new Set(prev).add(friendshipId));
    try {
      console.log("🔵 Accepting friend request:", friendshipId);
      await friendsService.acceptFriendRequest(friendshipId);
      toast({
        title: t("friendsRequestAccepted"),
        description: t("friendsRequestAcceptedDesc"),
      });
      // Refresh both friends list and requests
      await Promise.all([fetchFriends(), fetchPendingRequests()]);
    } catch (error: any) {
      console.error("🔴 Failed to accept request:", error);
      console.error("🔴 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast({
        title: t("friendsAcceptFailed"),
        description: error.response?.data?.message || error.response?.data?.detail || t("friendsAcceptFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(friendshipId);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (friendshipId: number) => {
    setProcessingIds(prev => new Set(prev).add(friendshipId));
    try {
      console.log("🔵 Rejecting friend request:", friendshipId);
      await friendsService.declineFriendRequest(friendshipId);
      toast({
        title: t("friendsRequestRejected"),
        description: t("friendsRequestRejectedDesc"),
      });
      fetchPendingRequests();
    } catch (error: any) {
      console.error("🔴 Failed to reject request:", error);
      console.error("🔴 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast({
        title: t("friendsRejectFailed"),
        description: error.response?.data?.message || error.response?.data?.detail || t("friendsRejectFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(friendshipId);
        return newSet;
      });
    }
  };

  const handleCancelRequest = async (friendshipId: number) => {
    setProcessingIds(prev => new Set(prev).add(friendshipId));
    try {
      console.log("🔵 Canceling friend request:", friendshipId);
      await friendsService.cancelFriendRequest(friendshipId);
      toast({
        title: t("friendsRequestCancelled") || "Request Cancelled",
        description: t("friendsRequestCancelledDesc") || "Friend request has been cancelled",
      });
      fetchPendingRequests();
    } catch (error: any) {
      console.error("🔴 Failed to cancel request:", error);
      console.error("🔴 Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast({
        title: t("friendsCancelFailed") || "Cancel Failed",
        description: error.response?.data?.message || error.response?.data?.detail || t("friendsCancelFailedDesc") || "Could not cancel request",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(friendshipId);
        return newSet;
      });
    }
  };

  const handleRemoveFriend = async (friendshipId: number) => {
    if (!confirm(t("friendsRemoveConfirm"))) return;
    
    setProcessingIds(prev => new Set(prev).add(friendshipId));
    try {
      await friendsService.removeFriend(friendshipId);
      toast({
        title: t("friendsFriendRemoved"),
        description: t("friendsFriendRemovedDesc"),
      });
      fetchFriends();
    } catch (error: any) {
      console.error("Failed to remove friend:", error);
      toast({
        title: t("friendsRemoveFailed"),
        description: error.response?.data?.message || t("friendsRemoveFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(friendshipId);
        return newSet;
      });
    }
  };

  const openNicknameDialog = (friend: FriendInfo) => {
    setSelectedFriend(friend);
    setNicknameInput(friend.nickname || "");
    setNicknameDialogOpen(true);
  };

  const handleUpdateNickname = async () => {
    if (!selectedFriend) return;

    setIsUpdatingNickname(true);
    try {
      await friendsService.updateNickname(selectedFriend.id, nicknameInput);
      toast({
        title: t("friendsNicknameUpdated"),
        description: t("friendsNicknameUpdatedDesc"),
      });
      fetchFriends();
      setNicknameDialogOpen(false);
    } catch (error: any) {
      console.error("Failed to update nickname:", error);
      toast({
        title: t("friendsNicknameUpdateFailed"),
        description: error.response?.data?.message || t("friendsNicknameUpdateFailedDesc"),
        variant: "destructive",
      });
    } finally {
      setIsUpdatingNickname(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getProfileImage = (profile: {
    profile_image_url?: string | null;
    profile_image?: string | null;
  }) => profile.profile_image_url || profile.profile_image || undefined;

  const filteredFriends = friends.filter(friend =>
    friend.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.friend_info.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <DashboardNav userRole={user?.user_type || "student"} userName={user?.full_name || user?.email || "User"} />
      
      <main className="container py-4 md:py-8 px-4">
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-foreground">
              {t("friendsTitle") || "Friends"}
            </h1>
            <p className="text-sm sm:text-sm md:text-base text-muted-foreground mt-1">
              {t("friendsDescription")}
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={t("friendsSearchPlaceholder")}
              className="pl-10 h-10 sm:h-11 text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto gap-2">
              <TabsTrigger value="friends" className="text-xs sm:text-sm py-2 sm:py-3">
                <Users className="h-4 w-4 mr-1.5 sm:mr-2" />
                <span>{t("friendsTabFriends")}</span>
                {friends.length > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                    {friends.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="requests" className="text-xs sm:text-sm py-2 sm:py-3">
                <Clock className="h-4 w-4 mr-1.5 sm:mr-2" />
                <span>{t("friendsTabRequests")}</span>
                {pendingRequests.length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="search" className="text-xs sm:text-sm py-2 sm:py-3">
                <UserPlus className="h-4 w-4 mr-1.5 sm:mr-2" />
                <span>{t("friendsTabSearch")}</span>
              </TabsTrigger>
            </TabsList>

            {/* Friends Tab */}
            <TabsContent value="friends" className="mt-4 space-y-4">
              <Alert className="flex items-center justify-center">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm sm:text-base text-center">
                  {t("friendsFilterAccepted")}
                </AlertDescription>
              </Alert>

              {isLoadingFriends ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    {searchQuery ? t("friendsNoFriendsFound") : t("friendsNoFriendsYet")}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                    {searchQuery 
                      ? t("friendsNoFriendsMatch")
                      : t("friendsAddFriendsToConnect")}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4">
                  {filteredFriends.map((friend) => (
                    <Card key={friend.id} className="w-full overflow-hidden">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                            <AvatarImage src={getProfileImage(friend.friend_info)} alt={friend.display_name} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-base">
                              {getInitials(friend.display_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-sm sm:text-base truncate">
                                {friend.display_name}
                              </h3>
                              {friend.nickname && (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                  Nickname
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                {friend.friend_info.user_type}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                              {friend.friend_info.email}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openNicknameDialog(friend)}
                            disabled={processingIds.has(friend.id)}
                            className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                          >
                            <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                            <span>{t("friendsNickname")}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveFriend(friend.id)}
                            disabled={processingIds.has(friend.id)}
                            className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                          >
                            {processingIds.has(friend.id) ? (
                              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 animate-spin" />
                            ) : (
                              <UserX className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                            )}
                            <span>{t("friendsRemove")}</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests" className="mt-4 space-y-4">
              <Alert className="flex items-center justify-center">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm sm:text-base text-center">
                  {t("friendsFilterPending")}
                </AlertDescription>
              </Alert>

              {isLoadingRequests ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">{t("friendsNoPendingRequests")}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                    {t("friendsNoPendingDesc")}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.id} className="w-full overflow-hidden">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                            <AvatarImage src={request.sender_profile_image_url || request.sender_profile_image || undefined} alt={request.sender_name} />
                            <AvatarFallback className="bg-muted text-muted-foreground text-sm sm:text-base">
                              {getInitials(request.sender_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-sm sm:text-base truncate">
                                {request.sender_name}
                              </h3>
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                {request.sender_type}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                              {request.sender_email}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAcceptRequest(request.id)}
                            disabled={processingIds.has(request.id)}
                            className="flex-1 h-8 sm:h-9 text-xs sm:text-sm bg-green-600 hover:bg-green-700"
                          >
                            {processingIds.has(request.id) ? (
                              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                            )}
                            <span>{t("friendsAccept")}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={processingIds.has(request.id)}
                            className="flex-1 h-8 sm:h-9 text-xs sm:text-sm"
                          >
                            {processingIds.has(request.id) ? (
                              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 animate-spin" />
                            ) : (
                              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                            )}
                            <span>{t("friendsReject")}</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Sent Requests Section */}
              {sentRequests.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    {t("friendsSentRequests") || "Sent Requests"} ({sentRequests.length})
                  </h3>
                  <div className="grid gap-3 sm:gap-4">
                    {sentRequests.map((request) => (
                      <Card key={request.id} className="w-full overflow-hidden opacity-75">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                              <AvatarImage src={request.recipient_profile_image_url || request.recipient_profile_image || undefined} alt={request.recipient_name} />
                              <AvatarFallback className="bg-muted text-muted-foreground text-sm sm:text-base">
                                {getInitials(request.recipient_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-sm sm:text-base truncate">
                                  {request.recipient_name}
                                </h3>
                                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                  {t("friendsPending") || "Pending"}
                                </Badge>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                                {request.recipient_email}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelRequest(request.id)}
                              disabled={processingIds.has(request.id)}
                              className="w-full h-8 sm:h-9 text-xs sm:text-sm"
                            >
                              {processingIds.has(request.id) ? (
                                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 animate-spin" />
                              ) : (
                                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                              )}
                              <span>{t("friendsCancel") || "Cancel Request"}</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Search/Add Tab */}
            <TabsContent value="search" className="mt-4 space-y-4">              <Alert className="flex items-center justify-center">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm sm:text-base text-center">                  {t("friendsFilterSearch")}
                </AlertDescription>
              </Alert>

              {searchQuery.length < 2 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">{t("friendsSearchForUsers")}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                    {t("friendsSearchMinChars")}
                  </p>
                </div>
              ) : isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-2">{t("friendsNoUsersFound")}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                    {t("friendsNoUsersMatch")}
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4">
                  {searchResults.map((searchUser) => (
                    <Card key={searchUser.id} className="w-full overflow-hidden">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                            <AvatarImage src={getProfileImage(searchUser)} alt={searchUser.full_name} />
                            <AvatarFallback className="bg-muted text-muted-foreground text-sm sm:text-base">
                              {getInitials(searchUser.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-sm sm:text-base truncate">
                                {searchUser.full_name}
                              </h3>
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                {searchUser.user_type}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">
                              {searchUser.email}
                            </p>
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleSendRequest(searchUser.id)}
                          disabled={processingIds.has(searchUser.id)}
                          className="w-full mt-3 h-8 sm:h-9 text-xs sm:text-sm"
                        >
                          {processingIds.has(searchUser.id) ? (
                            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 animate-spin" />
                          ) : (
                            <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                          )}
                          <span>{t("friendsSendRequest")}</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Nickname Dialog */}
      <Dialog open={nicknameDialogOpen} onOpenChange={setNicknameDialogOpen}>
        <DialogContent className="sm:max-w-[500px] w-[calc(100%-1rem)]">
          <DialogHeader>
            <DialogTitle>{t("friendsSetNickname")}</DialogTitle>
            <DialogDescription>
              {t("friendsSetNicknameDesc")} {selectedFriend?.friend_info.full_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">{t("friendsNicknameLabel")}</Label>
              <Input
                id="nickname"
                placeholder={t("friendsNicknamePlaceholder")}
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                maxLength={100}
                disabled={isUpdatingNickname}
                className="text-sm sm:text-base"
              />
              <p className="text-xs text-muted-foreground">
                {t("friendsNicknameHint")}
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              size="sm"
              variant="outline" 
              onClick={() => setNicknameDialogOpen(false)}
              disabled={isUpdatingNickname}
              className="flex-1 h-9 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleUpdateNickname}
              disabled={isUpdatingNickname}
              className="flex-1 h-9 text-xs sm:text-sm"
            >
              {isUpdatingNickname && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Friends;
