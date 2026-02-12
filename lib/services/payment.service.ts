/**
 * Service de paiement pour l'application web
 * Utilise Paystack via le backend
 */

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  MOBILE_MONEY = 'mobile_money',
  CREDIT_CARD = 'credit_card',
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  provider?: string;
  status: PaymentStatus;
  transactionId?: string;
  subscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  subscriptionPlanId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  provider?: string;
  customer?: {
    name: string;
    surname: string;
    email: string;
    phone_number: string;
    address: string;
    city: string;
    country: string;
    state: string;
    zip_code: string;
  };
}

// Mapping des méthodes de paiement frontend vers backend
const mapPaymentMethod = (method: string): string => {
  const mapping: Record<string, string> = {
    'visa-mastercard': 'credit_card',
    'credit_card': 'credit_card',
    'card': 'credit_card',
    'wave': 'mobile_money',
    'orange': 'mobile_money',
    'mtn': 'mobile_money',
    'moov': 'mobile_money',
  };
  return mapping[method] || method;
};

// Mapping des providers pour mobile money
const mapPaymentProvider = (method: string): string | undefined => {
  const mapping: Record<string, string> = {
    'wave': 'wave',
    'orange': 'orange',
    'mtn': 'mtn',
    'moov': 'moov',
  };
  return mapping[method];
};

class PaymentService {
  private baseUrl = '/api/proxy';

  /**
   * Crée un paiement et l'envoie au backend
   */
  async createPayment(dto: CreatePaymentDto): Promise<Payment> {
    const paymentData: Record<string, unknown> = {
      subscriptionPlanId: dto.subscriptionPlanId,
      amount: dto.amount,
      currency: dto.currency || 'XOF',
      method: mapPaymentMethod(dto.paymentMethod),
    };

    // Utiliser le provider passé directement dans le DTO, sinon essayer de le mapper
    const provider = dto.provider || mapPaymentProvider(dto.paymentMethod);
    if (provider) {
      paymentData.provider = provider;
    }

    if (dto.customer) {
      // Mapper les champs snake_case vers camelCase pour le backend
      paymentData.customer = {
        name: dto.customer.name,
        surname: dto.customer.surname,
        email: dto.customer.email,
        phoneNumber: dto.customer.phone_number,
        address: dto.customer.address,
        city: dto.customer.city,
        country: dto.customer.country,
        state: dto.customer.state,
        zipCode: dto.customer.zip_code,
      };
    }

    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erreur lors de la création du paiement');
    }

    const result = await response.json();
    return result.data || result;
  }

  /**
   * Récupère l'URL de paiement Paystack
   */
  async getPaymentUrl(paymentId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/payment-url`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erreur lors de la récupération de l\'URL de paiement');
    }

    const result = await response.json();
    const data = result.data || result;
    
    if (!data.payment_url) {
      throw new Error('URL de paiement non reçue du backend');
    }

    return data.payment_url;
  }

  /**
   * Initie le paiement Paystack - ouvre la page de paiement
   */
  async initiatePayment(paymentId: string): Promise<void> {
    const paymentUrl = await this.getPaymentUrl(paymentId);
    
    // Ouvrir la page de paiement Paystack dans un nouvel onglet
    window.open(paymentUrl, '_blank');
  }

  /**
   * Vérifie le statut d'un paiement Paystack
   */
  async checkPaystackStatus(paymentId: string): Promise<Payment> {
    const response = await fetch(`${this.baseUrl}/payments/paystack/check-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ paymentId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erreur lors de la vérification du paiement');
    }

    const result = await response.json();
    return result.data || result;
  }

  /**
   * Récupère la clé publique Paystack
   */
  async getPaystackPublicKey(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/payments/paystack/public-key`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de la clé publique Paystack');
    }

    const result = await response.json();
    return result.publicKey || result.data?.publicKey;
  }

  /**
   * @deprecated Utiliser getPaymentUrl() à la place
   */
  async getCinetPayUrl(paymentId: string): Promise<string> {
    return this.getPaymentUrl(paymentId);
  }

  /**
   * Vérifie le statut d'un paiement
   */
  async verifyPayment(paymentId: string): Promise<Payment> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Erreur lors de la vérification du paiement');
    }

    const result = await response.json();
    return result.data || result;
  }

  /**
   * Récupère un paiement par ID
   */
  async getPayment(paymentId: string): Promise<Payment | null> {
    try {
      const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.data || result;
    } catch {
      return null;
    }
  }

  /**
   * Récupère l'historique des paiements
   */
  async getPaymentHistory(): Promise<Payment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        return [];
      }

      const result = await response.json();
      const data = result.data || result;
      return Array.isArray(data) ? data : data.data || [];
    } catch {
      return [];
    }
  }
}

export const paymentService = new PaymentService();
