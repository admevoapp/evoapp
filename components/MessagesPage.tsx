
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { User, Message } from '../types';
import { MailIcon, TrashIcon } from './icons';
import { supabase } from '../lib/supabaseClient';
import { DEFAULT_AVATAR_URL } from '../constants';
import { useModal } from '../contexts/ModalContext';

interface MessagesPageProps {
  currentUser: User;
  onSendMessage: (receiverId: number | string, text: string) => void;
  targetUserId?: string | number | null;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ currentUser, targetUserId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [conversationPartners, setConversationPartners] = useState<User[]>([]);
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);
  const { showConfirm, showAlert } = useModal();

  // Fetch unique conversation partners
  const fetchPartners = async () => {
    setIsLoadingPartners(true);
    try {
      // 1. Get all messages where current user is sender or receiver
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('sender_id, receiver_id, created_at, content, sender_deleted, receiver_deleted')
        .or(`and(sender_id.eq.${currentUser.id},sender_deleted.eq.false),and(receiver_id.eq.${currentUser.id},receiver_deleted.eq.false)`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2. Extract unique partner IDs
      const partnerIds = new Set<string>();
      const lastMessageMap = new Map<string, any>();

      messagesData?.forEach((msg: any) => {
        const partnerId = msg.sender_id === currentUser.id ? msg.receiver_id : msg.sender_id;
        if (!partnerIds.has(partnerId)) {
          partnerIds.add(partnerId);
          // Since we ordered by created_at desc, the first time we see a partner, it's the latest message
          lastMessageMap.set(partnerId, msg);
        }
      });

      if (partnerIds.size === 0 && !targetUserId) {
        setConversationPartners([]);
        setIsLoadingPartners(false);
        return;
      }

      if (targetUserId) {
        partnerIds.add(String(targetUserId));
      }

      // 3. Fetch user details for these partners
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', Array.from(partnerIds));

      if (usersError) throw usersError;

      const partners = usersData?.map((u: any) => ({
        id: u.id,
        name: u.full_name || 'Usuário',
        username: u.username || '',
        avatarUrl: u.avatar_url || DEFAULT_AVATAR_URL,
        // Attach last message info for sorting/display
        lastMessage: lastMessageMap.get(u.id)
      })) || [];

      // Sort by last message time (if they have one)
      partners.sort((a, b) => {
        const timeA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
        const timeB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
        return timeB - timeA;
      });

      setConversationPartners(partners as unknown as User[]);

    } catch (err) {
      console.error("Error fetching conversation partners:", err);
    } finally {
      setIsLoadingPartners(false);
    }
  };

  // Sync selected user from prop
  useEffect(() => {
    if (targetUserId) {
      setSelectedUserId(targetUserId);
    }
  }, [targetUserId]);

  useEffect(() => {
    fetchPartners();
  }, [currentUser.id]);


  // Fetch messages for active chat
  useEffect(() => {
    if (!selectedUserId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUserId},sender_deleted.eq.false),and(sender_id.eq.${selectedUserId},receiver_id.eq.${currentUser.id},receiver_deleted.eq.false)`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        const mapped: Message[] = data.map((m: any) => ({
          id: m.id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          text: m.content,
          timestamp: new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isRead: m.is_read
        }));
        setMessages(mapped);
      }
    };

    fetchMessages();

    // Subscribe to new messages for this chat
    const channel = supabase
      .channel(`chat:${currentUser.id}-${selectedUserId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${currentUser.id}`, // We only need to listen for incoming here strictly, but filtering specifically is good
      }, (payload: any) => {
        // Check if the new message belongs to this conversation
        if (payload.new.sender_id === selectedUserId || payload.new.sender_id === currentUser.id) {
          // Add to stat
          const newMsg: Message = {
            id: payload.new.id,
            senderId: payload.new.sender_id,
            receiverId: payload.new.receiver_id,
            text: payload.new.content,
            timestamp: new Date(payload.new.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            isRead: payload.new.is_read
          };
          setMessages(prev => [...prev, newMsg]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [selectedUserId, currentUser.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUserId) {

      const content = newMessage;
      setNewMessage(''); // optimistic clear

      try {
        const { data, error } = await supabase
          .from('messages')
          .insert({
            sender_id: currentUser.id,
            receiver_id: selectedUserId,
            content: content
          })
          .select()
          .single();

        if (error) throw error;

        // Add to local state explicitly if subscription doesn't catch own inserts (Postgres changes sometimes don't trigger for own session in some configs, but usually they do. To be safe, we can add it OR wait for sub).
        // Supabase Realtime 'postgres_changes' triggers for all changes. But let's add it optimistically or via the response to be instant.
        const sentMsg: Message = {
          id: data.id,
          senderId: data.sender_id,
          receiverId: data.receiver_id,
          text: data.content,
          timestamp: new Date(data.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isRead: data.is_read
        };
        setMessages(prev => [...prev, sentMsg]);

      } catch (err) {
        console.error("Error sending message:", err);
        // TODO: restore text if failed
      }
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedUserId) return;

    const confirmed = await showConfirm(
      'Excluir Conversa',
      `Tem certeza que deseja excluir toda a conversa com ${selectedUser?.name || 'este usuário'}? Esta ação não pode ser desfeita.`,
      { icon: <TrashIcon className="w-8 h-8 text-red-500" /> }
    );

    if (confirmed) {
      try {
        // Update messages where I am the sender
        const { error: error1 } = await supabase
          .from('messages')
          .update({ sender_deleted: true })
          .eq('sender_id', currentUser.id)
          .eq('receiver_id', selectedUserId);

        if (error1) throw error1;

        // Update messages where I am the receiver
        const { error: error2 } = await supabase
          .from('messages')
          .update({ receiver_deleted: true })
          .eq('receiver_id', currentUser.id)
          .eq('sender_id', selectedUserId);

        if (error2) throw error2;

        // Reset state
        setSelectedUserId(null);
        setMessages([]);
        fetchPartners(); // Refresh partners list

        await showAlert('Sucesso', 'Conversa excluída com sucesso.');
      } catch (err) {
        console.error("Error deleting conversation:", err);
        await showAlert('Erro', 'Não foi possível excluir a conversa.');
      }
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedUser = useMemo(() => {
    return conversationPartners.find(user => user.id === selectedUserId);
  }, [selectedUserId, conversationPartners]);


  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden h-[calc(100vh-12rem)] flex">
      {/* Conversation List */}
      <div className="w-1/3 border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col">
        <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Conversas</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoadingPartners ? (
            <div className="p-4 text-center text-slate-500">Carregando...</div>
          ) : conversationPartners.length === 0 ? (
            <div className="p-4 text-center text-slate-500">Nenhuma conversa ainda.</div>
          ) : (
            conversationPartners.map(user => {
              // We stored lastMessage in the user object temporarily in logic above but types need handling
              // For now let's just render user
              // In a real app we'd augment the type properly
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full text-left p-4 flex items-center space-x-3 transition-colors ${selectedUserId === user.id ? 'bg-primary-light dark:bg-primary/20' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                >
                  <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1 overflow-hidden">
                    <p className={`font-semibold ${selectedUserId === user.id ? 'text-primary-dark dark:text-primary-light' : 'text-slate-800 dark:text-slate-200'}`}>{user.name}</p>
                  </div>
                </button>
              )
            }))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-2/3 flex flex-col">
        {selectedUserId ? (
          <>
            <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img src={selectedUser?.avatarUrl || DEFAULT_AVATAR_URL} alt={selectedUser?.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{selectedUser?.name || 'Usuário'}</h3>
                </div>
              </div>
              <button
                onClick={handleDeleteConversation}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                title="Excluir Conversa"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-dark">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-end ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'} mb-4`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${msg.senderId === currentUser.id ? 'bg-gradient-to-br from-primary-dark to-secondary text-white rounded-br-none' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm rounded-bl-none border border-slate-200 dark:border-slate-600'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 text-right ${msg.senderId === currentUser.id ? 'text-indigo-200' : 'text-slate-400'}`}>{msg.timestamp}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-surface-light dark:bg-surface-dark">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                {currentUser.status !== 'active' ? (
                  <div className="w-full p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium text-center">
                    Recurso bloqueado: Sua conta está suspensa.
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="block w-full h-[48px] px-4 rounded-xl border-[1.5px] border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0D0D0D] text-slate-700 dark:text-slate-200 placeholder-gray-400 focus:border-[#A171FF] focus:outline-none focus:ring-4 focus:ring-[#A171FF]/20 transition-all duration-200"
                    />
                    <button type="submit" disabled={!newMessage.trim()} className="px-6 py-3 bg-gradient-to-br from-primary-dark to-secondary text-white font-semibold rounded-xl shadow-md3-3 hover:shadow-md3-6 hover:-translate-y-0.5 disabled:opacity-50 transition-all duration-300 h-[48px]">
                      Enviar
                    </button>
                  </>
                )}
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-text dark:text-slate-400 bg-slate-50 dark:bg-dark p-8">
            <MailIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold">Suas Mensagens</h3>
            <p className="max-w-xs mt-2">Selecione uma conversa na lista ao lado para começar a conversar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
