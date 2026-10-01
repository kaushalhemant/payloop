import { User, Client, Invoice, Message, Payment } from '@/types';
import {
  INITIAL_USER,
  INITIAL_CLIENTS,
  INITIAL_INVOICES,
  INITIAL_MESSAGES,
  INITIAL_PAYMENTS,
  SAMPLE_CLIENTS,
  SAMPLE_INVOICES,
  SAMPLE_MESSAGES,
  SAMPLE_PAYMENTS,
} from './mockData';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// In-memory runtime cache for server-side & local development (Defaults to clean empty workspace)
let memoryStore = {
  user: { ...INITIAL_USER },
  clients: [...INITIAL_CLIENTS],
  invoices: [...INITIAL_INVOICES],
  messages: [...INITIAL_MESSAGES],
  payments: [...INITIAL_PAYMENTS],
};

const STORAGE_KEYS = {
  USER: 'payloop_user',
  CLIENTS: 'payloop_clients',
  INVOICES: 'payloop_invoices',
  MESSAGES: 'payloop_messages',
  PAYMENTS: 'payloop_payments',
};

// Helper for client-side localStorage hydration
export const getLocalData = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
};

export const setLocalData = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
};

export const db = {
  // 1. User methods
  getUser: async (): Promise<User> => {
    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('users').select('*').limit(1).single();
      if (!error && data) return data as User;
    }
    if (typeof window !== 'undefined') {
      return getLocalData(STORAGE_KEYS.USER, memoryStore.user);
    }
    return memoryStore.user;
  },

  updateUser: async (updates: Partial<User>): Promise<User> => {
    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('users').update(updates).eq('id', memoryStore.user.id).select().single();
      if (!error && data) return data as User;
    }
    memoryStore.user = { ...memoryStore.user, ...updates };
    if (typeof window !== 'undefined') {
      setLocalData(STORAGE_KEYS.USER, memoryStore.user);
    }
    return memoryStore.user;
  },

  // 2. Client methods
  getClients: async (): Promise<Client[]> => {
    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('clients').select('*').order('name');
      if (!error && data) return data as Client[];
    }
    if (typeof window !== 'undefined') {
      return getLocalData(STORAGE_KEYS.CLIENTS, memoryStore.clients);
    }
    return memoryStore.clients;
  },

  getClientById: async (id: string): Promise<Client | undefined> => {
    const clients = await db.getClients();
    return clients.find((c) => c.id === id);
  },

  createClient: async (clientData: Omit<Client, 'id' | 'created_at'>): Promise<Client> => {
    const newClient: Client = {
      ...clientData,
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
    };

    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('clients').insert([newClient]).select().single();
      if (!error && data) return data as Client;
    }

    memoryStore.clients.push(newClient);
    if (typeof window !== 'undefined') {
      setLocalData(STORAGE_KEYS.CLIENTS, memoryStore.clients);
    }
    return newClient;
  },

  updateClient: async (id: string, updates: Partial<Client>): Promise<Client | undefined> => {
    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('clients').update(updates).eq('id', id).select().single();
      if (!error && data) return data as Client;
    }

    const index = memoryStore.clients.findIndex((c) => c.id === id);
    if (index !== -1) {
      memoryStore.clients[index] = { ...memoryStore.clients[index], ...updates };
      if (typeof window !== 'undefined') {
        setLocalData(STORAGE_KEYS.CLIENTS, memoryStore.clients);
      }
      return memoryStore.clients[index];
    }
    return undefined;
  },

  deleteClient: async (id: string): Promise<boolean> => {
    const supabase = createServerSupabaseClient();
    if (supabase) {
      await supabase.from('clients').delete().eq('id', id);
    }
    memoryStore.clients = memoryStore.clients.filter((c) => c.id !== id);
    if (typeof window !== 'undefined') {
      setLocalData(STORAGE_KEYS.CLIENTS, memoryStore.clients);
    }
    return true;
  },

  // 3. Invoice methods
  getInvoices: async (): Promise<Invoice[]> => {
    const supabase = createServerSupabaseClient();
    let invoices: Invoice[] = [];
    if (supabase) {
      const { data, error } = await supabase.from('invoices').select('*, client:clients(*)').order('created_at', { ascending: false });
      if (!error && data) return data as Invoice[];
    }

    if (typeof window !== 'undefined') {
      invoices = getLocalData(STORAGE_KEYS.INVOICES, memoryStore.invoices);
    } else {
      invoices = memoryStore.invoices;
    }

    const clients = await db.getClients();
    return invoices.map((inv) => ({
      ...inv,
      client: clients.find((c) => c.id === inv.client_id),
    }));
  },

  getInvoiceById: async (id: string): Promise<Invoice | undefined> => {
    const invoices = await db.getInvoices();
    return invoices.find((inv) => inv.id === id);
  },

  createInvoice: async (invoiceData: Omit<Invoice, 'id' | 'created_at'>): Promise<Invoice> => {
    const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id,
      stripe_checkout_url: invoiceData.stripe_checkout_url || `/pay/${id}`,
      created_at: new Date().toISOString(),
    };

    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('invoices').insert([newInvoice]).select().single();
      if (!error && data) return data as Invoice;
    }

    memoryStore.invoices.unshift(newInvoice);
    if (typeof window !== 'undefined') {
      setLocalData(STORAGE_KEYS.INVOICES, memoryStore.invoices);
    }

    const clients = await db.getClients();
    return {
      ...newInvoice,
      client: clients.find((c) => c.id === newInvoice.client_id),
    };
  },

  updateInvoice: async (id: string, updates: Partial<Invoice>): Promise<Invoice | undefined> => {
    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('invoices').update(updates).eq('id', id).select().single();
      if (!error && data) return data as Invoice;
    }

    const index = memoryStore.invoices.findIndex((inv) => inv.id === id);
    if (index !== -1) {
      memoryStore.invoices[index] = { ...memoryStore.invoices[index], ...updates };
      if (typeof window !== 'undefined') {
        setLocalData(STORAGE_KEYS.INVOICES, memoryStore.invoices);
      }
      const clients = await db.getClients();
      return {
        ...memoryStore.invoices[index],
        client: clients.find((c) => c.id === memoryStore.invoices[index].client_id),
      };
    }
    return undefined;
  },

  deleteInvoice: async (id: string): Promise<boolean> => {
    const supabase = createServerSupabaseClient();
    if (supabase) {
      await supabase.from('invoices').delete().eq('id', id);
    }
    memoryStore.invoices = memoryStore.invoices.filter((inv) => inv.id !== id);
    if (typeof window !== 'undefined') {
      setLocalData(STORAGE_KEYS.INVOICES, memoryStore.invoices);
    }
    return true;
  },

  // 4. Message methods
  getMessages: async (invoiceId?: string): Promise<Message[]> => {
    const supabase = createServerSupabaseClient();
    if (supabase) {
      let query = supabase.from('messages').select('*').order('created_at', { ascending: false });
      if (invoiceId) query = query.eq('invoice_id', invoiceId);
      const { data, error } = await query;
      if (!error && data) return data as Message[];
    }

    let messages = typeof window !== 'undefined'
      ? getLocalData(STORAGE_KEYS.MESSAGES, memoryStore.messages)
      : memoryStore.messages;

    if (invoiceId) {
      messages = messages.filter((m) => m.invoice_id === invoiceId);
    }
    return messages;
  },

  createMessage: async (messageData: Omit<Message, 'id' | 'created_at'>): Promise<Message> => {
    const newMessage: Message = {
      ...messageData,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
    };

    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('messages').insert([newMessage]).select().single();
      if (!error && data) return data as Message;
    }

    memoryStore.messages.unshift(newMessage);
    if (typeof window !== 'undefined') {
      setLocalData(STORAGE_KEYS.MESSAGES, memoryStore.messages);
    }
    return newMessage;
  },

  updateMessage: async (id: string, updates: Partial<Message>): Promise<Message | undefined> => {
    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('messages').update(updates).eq('id', id).select().single();
      if (!error && data) return data as Message;
    }

    const index = memoryStore.messages.findIndex((m) => m.id === id);
    if (index !== -1) {
      memoryStore.messages[index] = { ...memoryStore.messages[index], ...updates };
      if (typeof window !== 'undefined') {
        setLocalData(STORAGE_KEYS.MESSAGES, memoryStore.messages);
      }
      return memoryStore.messages[index];
    }
    return undefined;
  },

  // 5. Payment methods
  getPayments: async (): Promise<Payment[]> => {
    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('payments').select('*, invoice:invoices(*)').order('created_at', { ascending: false });
      if (!error && data) return data as Payment[];
    }

    return typeof window !== 'undefined'
      ? getLocalData(STORAGE_KEYS.PAYMENTS, memoryStore.payments)
      : memoryStore.payments;
  },

  createPayment: async (paymentData: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> => {
    const newPayment: Payment = {
      ...paymentData,
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      created_at: new Date().toISOString(),
    };

    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('payments').insert([newPayment]).select().single();
      if (!error && data) return data as Payment;
    }

    memoryStore.payments.unshift(newPayment);
    if (typeof window !== 'undefined') {
      setLocalData(STORAGE_KEYS.PAYMENTS, memoryStore.payments);
    }
    return newPayment;
  },

  // 6. Complete Payment & Split Processor
  processInvoicePayment: async (
    invoiceId: string,
    stripePaymentId: string,
    feePercentOverride?: number
  ): Promise<{ payment: Payment; invoice: Invoice }> => {
    const invoice = await db.getInvoiceById(invoiceId);
    if (!invoice) throw new Error(`Invoice ${invoiceId} not found`);

    const user = await db.getUser();
    const feeRate = (feePercentOverride !== undefined ? feePercentOverride : user.fee_percent) / 100;
    const amount = invoice.amount;
    const platformFee = Math.round(amount * feeRate * 100) / 100;
    const freelancerPayout = Math.round((amount - platformFee) * 100) / 100;

    // Create payment split record
    const payment = await db.createPayment({
      invoice_id: invoiceId,
      amount_paid: amount,
      platform_fee: platformFee,
      freelancer_payout: freelancerPayout,
      stripe_payment_id: stripePaymentId,
      stripe_transfer_id: `tr_${Math.random().toString(36).substr(2, 9)}`,
      stripe_connect_account_id: user.stripe_connect_account_id || 'acct_direct_settlement',
      status: 'completed',
    });

    // Mark invoice as paid
    const updatedInvoice = await db.updateInvoice(invoiceId, {
      status: 'paid',
      paid_at: new Date().toISOString(),
    });

    return { payment, invoice: updatedInvoice! };
  },

  // 7. Reset or Seed Data
  resetDatabase: async (mode: 'clean' | 'sample' = 'clean'): Promise<void> => {
    if (mode === 'sample') {
      memoryStore = {
        user: {
          ...INITIAL_USER,
          name: 'Demo Workspace',
          business_name: 'Studio Creative Lab',
          email: 'demo@studiocreative.dev',
          stripe_connect_account_id: 'acct_sample_express',
          stripe_connect_status: 'active',
        },
        clients: [...SAMPLE_CLIENTS],
        invoices: [...SAMPLE_INVOICES],
        messages: [...SAMPLE_MESSAGES],
        payments: [...SAMPLE_PAYMENTS],
      };
    } else {
      memoryStore = {
        user: { ...INITIAL_USER },
        clients: [],
        invoices: [],
        messages: [],
        payments: [],
      };
    }

    if (typeof window !== 'undefined') {
      if (mode === 'sample') {
        setLocalData(STORAGE_KEYS.USER, memoryStore.user);
        setLocalData(STORAGE_KEYS.CLIENTS, memoryStore.clients);
        setLocalData(STORAGE_KEYS.INVOICES, memoryStore.invoices);
        setLocalData(STORAGE_KEYS.MESSAGES, memoryStore.messages);
        setLocalData(STORAGE_KEYS.PAYMENTS, memoryStore.payments);
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.CLIENTS);
        localStorage.removeItem(STORAGE_KEYS.INVOICES);
        localStorage.removeItem(STORAGE_KEYS.MESSAGES);
        localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
      }
    }
  },
};
