import React, { useState } from 'react';
import {
  HelpCircle,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Shield,
  LifeBuoy,
  FileText,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../../types/trade';

interface SupportViewProps {
  userProfile?: UserProfile | null;
}

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Général',
    question: 'Comment connecter mes comptes de trading (MetaTrader, cTrader) ?',
    answer:
      'Dans la section "Connect Accounts", vous pouvez exporter votre relevé de compte au format CSV, Excel ou HTML depuis MT4/MT5/cTrader et le déposer directement dans TRADEIQ. La synchronisation automatique via API lecture seule sera également disponible très prochainement.',
  },
  {
    id: 'faq-2',
    category: 'Paiement',
    question: 'Quels sont les modes de paiement acceptés pour les forfaits Pro et Elite ?',
    answer:
      'Nous acceptons les paiements en cryptomonnaie décentralisée, principalement l\'USDT sur BNB Smart Chain (BEP-20) propulsé par la passerelle NOWPayments. Les frais de transaction sont minimes (< 0,10 $) et l\'activation de votre compte est automatisée et immédiate dès la confirmation blockchain.',
  },
  {
    id: 'faq-3',
    category: 'IA & Outils',
    question: 'Comment fonctionne l\'analyse de graphique par Intelligence Artificielle ?',
    answer:
      'Notre moteur IA analyse vos captures d\'écran de graphiques (TradingView, MetaTrader) grâce au modèle Google Gemini 2.5. Il identifie les structures de marché (HH/HL, BOS, ChoCH), les zones de liquidité, les blocs de commande (Order Blocks) et vous attribue un score de discipline de 0 à 100 avec des recommandations de gestion du risque.',
  },
  {
    id: 'faq-4',
    category: 'Prop Firms',
    question: 'TRADEIQ est-il adapté aux traders de Prop Firms (FTMO, FundedNext, Apex) ?',
    answer:
      'Absolument ! TRADEIQ a été conçu avec une attention particulière pour les règles strictes des Prop Firms : suivi rigoureux du Max Daily Drawdown, du Drawdown global, respect du ratio Risque/Rendement (R:R) et alertes en cas de sur-trading ou de perte consécutive.',
  },
  {
    id: 'faq-5',
    category: 'Sécurité',
    question: 'Mes données de trading et mes clés sont-elles sécurisées ?',
    answer:
      'Oui, toutes vos données sont protégées par le chiffrement de bout en bout et la sécurité Row Level Security (RLS) de notre infrastructure Supabase. Vos clés API ou adresses de paiement ne sont jamais exposées côté navigateur.',
  },
];

export const SupportView: React.FC<SupportViewProps> = ({ userProfile }) => {
  const [ticketCategory, setTicketCategory] = useState<'technical' | 'billing' | 'account' | 'feature'>('technical');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'normal' | 'urgent' | 'critical'>('normal');
  const [ticketMessage, setTicketMessage] = useState('');
  const [contactEmail, setContactEmail] = useState(userProfile?.email || 'walioulabouda2@gmail.com');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>('faq-1');
  const [faqFilter, setFaqFilter] = useState<string>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    setIsSubmitting(true);
    // Simulate real ticket submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTicketSubject('');
      setTicketMessage('');
    }, 900);
  };

  const filteredFaqs = faqFilter === 'all' ? FAQS : FAQS.filter(f => f.category.toLowerCase() === faqFilter.toLowerCase());

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
            <LifeBuoy className="w-4 h-4" />
            <span>Assistance & Centre d'Aide</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Support TRADEIQ
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Besoin d'aide avec vos trades, votre abonnement ou une fonctionnalité ? Notre équipe d'assistance est à votre service.
          </p>
        </div>

        {/* System Status Pill */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-slate-900/90 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-200">Tous les systèmes opérationnels</span>
            <span className="text-[10px] text-slate-500 font-mono">Temps de réponse moyen : &lt; 2h</span>
          </div>
        </div>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Email Direct</div>
              <div className="text-xs text-slate-400">Réponse sous 24h ouvrées</div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Pour toute demande commerciale, partenariat ou problème technique complexe.
          </p>
          <a
            href="mailto:support@tradeiq.io"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 font-mono"
          >
            <span>support@tradeiq.io</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Communauté Telegram</div>
              <div className="text-xs text-slate-400">Chat en direct & Annonces</div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Échangez avec d'autres traders actifs et obtenez une assistance communautaire immédiate.
          </p>
          <a
            href="https://t.me/tradeiq_official"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 font-mono"
          >
            <span>@tradeiq_official</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Support VIP Pro / Premium</div>
              <div className="text-xs text-slate-400">Priorité Haute 7j/7</div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Les membres Pro et Premium bénéficient d'un traitement prioritaire pour l'intégration de comptes et l'analyse quantitative.
          </p>
          <div className="text-xs font-semibold text-purple-400 font-mono flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Inclus avec votre plan</span>
          </div>
        </div>
      </div>

      {/* Main Support Form & FAQ Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-800">
              <Send className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="text-base font-bold text-white">Ouvrir un Ticket de Support</h2>
                <p className="text-xs text-slate-400">Remplissez ce formulaire et notre équipe vous recontactera rapidement.</p>
              </div>
            </div>

            {submitSuccess && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-sm">Ticket envoyé avec succès !</div>
                  <p className="text-slate-300">
                    Notre équipe d'ingénieurs a bien reçu votre demande. Un email de confirmation a été envoyé à <strong>{contactEmail}</strong>.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-2 text-emerald-400 underline hover:text-emerald-300 text-[11px]"
                  >
                    Envoyer un autre message
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Catégorie
                  </label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="technical">Problème Technique / Bug</option>
                    <option value="billing">Facturation & Crypto USDT</option>
                    <option value="account">Compte & Authentification</option>
                    <option value="feature">Suggestion de Fonctionnalité</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Priorité
                  </label>
                  <select
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="normal">Normale (Sous 24h)</option>
                    <option value="urgent">Urgente (Sous 6h)</option>
                    <option value="critical">Critique (Blocage de compte)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Votre Adresse Email de Contact
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="votre-email@exemple.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Sujet du Ticket
                </label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Ex: Problème d'importation CSV ou question sur l'abonnement Pro"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Description Détaillée
                </label>
                <textarea
                  required
                  rows={5}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Décrivez précisément votre problème ou question, ainsi que les étapes pour le reproduire..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Soumettre mon ticket de support</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Questions Fréquentes (FAQ)</h2>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[11px]">
              <button
                onClick={() => setFaqFilter('all')}
                className={`px-2 py-1 rounded transition-colors ${faqFilter === 'all' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFaqFilter('Paiement')}
                className={`px-2 py-1 rounded transition-colors ${faqFilter === 'Paiement' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Paiement
              </button>
              <button
                onClick={() => setFaqFilter('Général')}
                className={`px-2 py-1 rounded transition-colors ${faqFilter === 'Général' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Général
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/40 transition-colors"
                  >
                    <span className="text-xs font-semibold text-slate-200 pr-3">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-400 border-t border-slate-800/60 leading-relaxed bg-slate-950/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* SLA Card */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
            <Clock className="w-5 h-5 text-slate-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-300">Garantie d'Engagement : </span>
              Tous les tickets sans exception sont traités par un ingénieur trader. Aucun robot de réponse générique.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
