import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/src/context/AuthContext';
import { api } from '@/src/lib/api';
import { toast } from 'sonner';
import { MessageSquare, Ticket } from 'lucide-react';

export const NotificationListener: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const lastTicketId = useRef<string | null>(null);
  const lastMessageCount = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;

    const checkNotifications = async () => {
      try {
        const tickets = await api.tickets.list();
        
        // 1. Check for new tickets (Admin only)
        if (isAdmin && tickets.length > 0) {
          const latestTicket = tickets[0];
          if (lastTicketId.current && lastTicketId.current !== latestTicket.id) {
            toast(`New ${latestTicket.type} request`, {
              description: `From ${latestTicket.consumerName} for ${latestTicket.category}`,
              icon: <Ticket className="h-4 w-4 text-primary" />,
            });
          }
          lastTicketId.current = latestTicket.id;
        }

        // 2. Check for new messages
        tickets.forEach((ticket: any) => {
          const messages = ticket.messages || [];
          const currentCount = messages.length;
          const previousCount = lastMessageCount.current[ticket.id] || 0;

          if (previousCount > 0 && currentCount > previousCount) {
            const lastMessage = messages[messages.length - 1];
            const myId = user.id || user.uid;
            if (lastMessage.senderId !== myId) {
              toast(`New message in Ticket #${ticket.id.substring(0, 5)}`, {
                description: `${lastMessage.senderName}: ${lastMessage.text.substring(0, 30)}${lastMessage.text.length > 30 ? '...' : ''}`,
                icon: <MessageSquare className="h-4 w-4 text-primary" />,
              });
            }
          }
          lastMessageCount.current[ticket.id] = currentCount;
        });

      } catch (error) {
        console.error("Notification check error:", error);
      }
    };

    const interval = setInterval(checkNotifications, 10000);
    checkNotifications(); // Initial check

    return () => clearInterval(interval);
  }, [user, isAdmin]);

  return null;
};
