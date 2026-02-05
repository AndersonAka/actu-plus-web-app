# 📧 Solutions Email pour l'Afrique

## Vue d'ensemble

Pour l'envoi d'emails transactionnels (réinitialisation de mot de passe, confirmations, notifications), voici les solutions recommandées qui fonctionnent bien en Afrique.

---

## 🏆 Solutions Recommandées

### 1. **Brevo (ex-Sendinblue)** ⭐ RECOMMANDÉ
- **Site**: https://www.brevo.com
- **Prix**: Gratuit jusqu'à 300 emails/jour
- **Avantages**:
  - Excellente délivrabilité en Afrique
  - Interface en français
  - API simple et bien documentée
  - Support des SMS (bonus)
  - RGPD compliant

```bash
npm install @sendinblue/client
```

```typescript
// Exemple d'intégration NestJS
import * as SibApiV3Sdk from '@sendinblue/client';

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const sendSmtpEmail = {
  to: [{ email: 'user@example.com', name: 'User' }],
  templateId: 1, // ID du template
  params: { resetLink: 'https://...' },
};

await apiInstance.sendTransacEmail(sendSmtpEmail);
```

---

### 2. **Mailjet**
- **Site**: https://www.mailjet.com
- **Prix**: Gratuit jusqu'à 200 emails/jour (6000/mois)
- **Avantages**:
  - Présence en Afrique (partenaire Orange)
  - Bonne délivrabilité
  - Templates drag-and-drop
  - API REST simple

```bash
npm install node-mailjet
```

```typescript
import Mailjet from 'node-mailjet';

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_SECRET_KEY,
});

await mailjet.post('send', { version: 'v3.1' }).request({
  Messages: [{
    From: { Email: 'noreply@actuplus.com', Name: 'Actu Plus' },
    To: [{ Email: 'user@example.com' }],
    Subject: 'Réinitialisation de mot de passe',
    HTMLPart: '<h1>Cliquez sur le lien...</h1>',
  }],
});
```

---

### 3. **Resend** (Modern & Simple)
- **Site**: https://resend.com
- **Prix**: Gratuit jusqu'à 3000 emails/mois
- **Avantages**:
  - API moderne et simple
  - Excellente documentation
  - Support React Email
  - Délivrabilité optimisée

```bash
npm install resend
```

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Actu Plus <noreply@actuplus.com>',
  to: ['user@example.com'],
  subject: 'Réinitialisation de mot de passe',
  html: '<h1>Cliquez sur le lien...</h1>',
});
```

---

### 4. **Amazon SES** (Scalable)
- **Site**: https://aws.amazon.com/ses/
- **Prix**: $0.10 pour 1000 emails
- **Avantages**:
  - Très économique à grande échelle
  - Infrastructure fiable
  - Région af-south-1 (Afrique du Sud)

```bash
npm install @aws-sdk/client-ses
```

---

## 📱 Solutions SMS (Alternative/Complément)

Pour les pays où l'email est moins utilisé, considérez le SMS :

### 1. **Twilio**
- Couverture mondiale incluant l'Afrique
- API fiable

### 2. **Africa's Talking**
- **Site**: https://africastalking.com
- Spécialisé Afrique
- SMS, USSD, Voice
- Présent dans 20+ pays africains

### 3. **Orange SMS API**
- Disponible via Orange Business Services
- Excellente couverture en Afrique francophone

---

## 🔧 Configuration NestJS Recommandée

### Module Email Service

```typescript
// src/email/email.module.ts
import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';

@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
```

```typescript
// src/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    
    // Utiliser Brevo, Mailjet, ou Resend ici
    // ...
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    // ...
  }

  async sendPaymentConfirmation(email: string, amount: number): Promise<void> {
    // ...
  }
}
```

---

## 📊 Comparaison Rapide

| Service | Gratuit | Délivrabilité Afrique | Facilité | Prix/1000 |
|---------|---------|----------------------|----------|-----------|
| **Brevo** | 300/jour | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ~$25 |
| **Mailjet** | 200/jour | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ~$15 |
| **Resend** | 3000/mois | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ~$20 |
| **Amazon SES** | 62K/mois* | ⭐⭐⭐ | ⭐⭐⭐ | $0.10 |

*Si envoyé depuis EC2

---

## ✅ Recommandation Finale

Pour **Actu Plus**, je recommande **Brevo (Sendinblue)** car :
1. Plan gratuit généreux (300 emails/jour = 9000/mois)
2. Excellente délivrabilité en Afrique francophone
3. Interface et support en français
4. Possibilité d'envoyer des SMS également
5. Templates professionnels inclus
6. Conforme RGPD

### Variables d'environnement à ajouter

```env
# .env
BREVO_API_KEY=xkeysib-xxxxx
EMAIL_FROM=noreply@actuplus.com
EMAIL_FROM_NAME=Actu Plus
```
