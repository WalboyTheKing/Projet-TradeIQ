// ============================================================================
// TRADEIQ LEARNING — PEDAGOGICAL CURRICULUM & DATA REPOSITORY
// Objective Quantitative Formations, Realistic Probability Models, Visual Diagrams & Quizzes
// ============================================================================

export type ModuleCategory =
  | 'SMC & Liquidité'
  | 'Prop Firms'
  | 'Psychologie'
  | 'Risk Management';

export type TierRequired = 'free' | 'pro' | 'premium';

export interface QuizQuestion {
  id: string;
  question: string;
  chartImageSvg?: string; // Optional embedded SVG candlestick chart for visual analysis
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  duration: string;
  requiredTier: TierRequired;
  summary: string;
  content: {
    introduction: string;
    keyConcepts: {
      concept: string;
      explanation: string;
      counterExample?: string;
    }[];
    diagramSvg?: string; // Custom SVG visual representation
    takeaways: string[];
    journalApplicationPrompt: string;
  };
  quiz?: QuizQuestion[];
}

export interface LearningModule {
  id: string;
  title: string;
  subtitle: string;
  category: ModuleCategory;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  duration: string;
  lessonsCount: number;
  freeLessonsCount: number;
  badge: string;
  accentColor: string;
  coverSvg: string;
  description: string;
  whyItMatters: string;
  lessons: Lesson[];
  calculatorId: 'smc-rr' | 'propfirm-drawdown' | 'psychology-drift' | 'risk-expectancy';
  journalAuditCriteria: {
    metricChecked: string;
    benchmark: string;
    description: string;
  }[];
}

export const LEARNING_MODULES: LearningModule[] = [
  // ==========================================================================
  // MODULE 1 : SMC & LIQUIDITÉ
  // ==========================================================================
  {
    id: 'smc-liquidity',
    title: 'Smart Money Concepts & Cartographie de Liquidité',
    subtitle: 'Lecture objective de la structure de marché, cartographie des pools et détection des fausses cassures',
    category: 'SMC & Liquidité',
    level: 'Intermédiaire',
    duration: '2h 15m',
    lessonsCount: 4,
    freeLessonsCount: 1,
    badge: 'Structure de Marché',
    accentColor: '#10B981', // Emerald
    coverSvg: 'smc_cover',
    description: 'Une approche analytique et probabiliste des déséquilibres (Fair Value Gaps), des Order Blocks et des cassures de structure (BOS vs CHoCH). Nous abordons ces concepts comme des outils d\'interprétation de flux, et non comme des vérités absolues ou des promesses magiques.',
    whyItMatters: 'Comprendre où la liquidité s\'accumule permet d\'éviter d\'entrer précisément là où les ordres stop des traders particuliers sont balayés.',
    calculatorId: 'smc-rr',
    journalAuditCriteria: [
      {
        metricChecked: 'R-Multiple Réalisé vs Prévu',
        benchmark: 'R moyen ≥ 1.8R',
        description: 'Vérifie si vos entrées sur structures validées offrent un ratio risque/rendement asymétrique réel.',
      },
      {
        metricChecked: 'Taux de Faux Breakouts subis',
        benchmark: 'Moins de 25% de pertes par sweep',
        description: 'Analyse si vos stops sont placés trop près des liquidités évidentes identifiées dans vos notes.',
      },
    ],
    lessons: [
      {
        id: 'smc-l1',
        number: 1,
        title: 'Fondations : FVG, Order Blocks et Structure de Marché (BOS vs CHoCH)',
        duration: '25 min',
        requiredTier: 'free',
        summary: 'Distinguer une continuité de tendance (BOS) d\'un changement de caractère structurel (CHoCH), et identifier les zones d\'efficience de prix.',
        content: {
          introduction: 'Les concepts SMC (Smart Money Concepts) formalisent ce que les analystes techniques appellent depuis des décennies la structure des prix et le déséquilibre d\'ordres. Loin d\'être une formule secrète, il s\'agit d\'un langage méthodique pour repérer les asymétries de liquidité.',
          keyConcepts: [
            {
              concept: 'Fair Value Gap (FVG) / Inefficient Price Action',
              explanation: 'Un FVG est un vide de liquidité créé sur une série de 3 bougies consécutives où la mèche de la bougie 1 et la mèche de la bougie 3 ne se touchent pas. Ce déséquilibre montre une agressivité unidirectionnelle des ordres à court terme.',
              counterExample: 'Contre-exemple : un FVG n\'est PAS un niveau de rebond automatique. Dans un marché fortement directionnel ou lors de nouvelles macroéconomiques, le prix traverse souvent les FVG sans la moindre réaction.',
            },
            {
              concept: 'BOS (Break of Structure) vs CHoCH (Change of Character)',
              explanation: 'Un BOS confirme la continuation d\'une tendance haussière (nouveau plus haut au-dessus du swing high précédent) ou baissière. Un CHoCH marque la rupture du dernier plus bas ayant créé le plus haut, signalant un possible épuisement ou retournement.',
              counterExample: 'Contre-exemple : une simple mèche qui dépasse un plus haut sans clôture nette n\'est pas un BOS confirmé, mais souvent un sweep de liquidité.',
            },
            {
              concept: 'Order Block (OB)',
              explanation: 'L\'Order Block correspond généralement à la dernière bougie baissière avant une forte impulsion haussière (ou inversement). Il représente une zone où un volume important a été absorbé avant le déplacement rapide.',
              counterExample: 'Contre-exemple : un Order Block situé au milieu de nulle part sans balayage de liquidité préalable a une faible probabilité de succès.',
            },
          ],
          diagramSvg: 'smc_structure_diagram',
          takeaways: [
            'Attendez toujours la clôture de la bougie pour valider un BOS ou un CHoCH.',
            'Un Order Block n\'est pertinent que s\'il a provoqué un déséquilibre (FVG) ou brisé une structure claire.',
            'Ces concepts sont des outils de cadrage probabiliste, pas une garantie de direction.',
          ],
          journalApplicationPrompt: 'Dans votre journal, regardez vos 5 derniers trades perdants : étiez-vous entré sur une clôture confirmée ou sur une simple mèche impulsive ?',
        },
        quiz: [
          {
            id: 'q1-1',
            question: 'Quelle est la différence fondamentale entre un BOS et un CHoCH ?',
            options: [
              'Le BOS est réservé aux cryptomonnaies, le CHoCH au Forex.',
              'Le BOS valide la continuité de la structure, tandis que le CHoCH indique un changement potentiel de caractère de la tendance.',
              'Le CHoCH garantit à 100% que le marché va se retourner immédiatement.',
              'Il n\'y a aucune différence, ce sont deux termes strictement synonymes.',
            ],
            correctIndex: 1,
            explanation: 'Exact ! Le BOS (Break of Structure) confirme la poursuite de la tendance saine, tandis que le CHoCH (Change of Character) signale la première brèche dans la séquence des swings, incitant à la prudence.',
          },
          {
            id: 'q1-2',
            question: 'Face à un Fair Value Gap (FVG), quelle attitude quantitative est la plus rigoureuse ?',
            options: [
              'Acheter immédiatement dès que le prix touche le haut du FVG avec un levier maximal.',
              'Considérer le FVG comme une zone d\'intérêt à surveiller en attendant une confirmation locale de réaction du prix.',
              'Placer un ordre stop loss à l\'intérieur même du FVG.',
              'Ignorer le FVG car les déséquilibres de prix ne se comblent jamais.',
            ],
            correctIndex: 1,
            explanation: 'Très bien. Un FVG est un repère probabiliste. Les traders professionnels attendent une confirmation d\'épuisement ou de reprise de structure dans la zone avant d\'engager du capital.',
          },
        ],
      },
      {
        id: 'smc-l2',
        number: 2,
        title: 'Cartographie des Pools de Liquidité (Buy-Side vs Sell-Side)',
        duration: '35 min',
        requiredTier: 'pro',
        summary: 'Localiser où se concentrent les ordres stop des acheteurs et des vendeurs sur les sommets et creux majeurs.',
        content: {
          introduction: 'Les marchés ont besoin de contrepartie pour exécuter des ordres de grande taille. Les sommets et creux évidents attirent naturellement des amas d\'ordres stop (Buy-Side Liquidity au-dessus des résistances, Sell-Side Liquidity sous les supports).',
          keyConcepts: [
            {
              concept: 'BSL (Buy-Side Liquidity) et SSL (Sell-Side Liquidity)',
              explanation: 'La BSL représente les ordres d\'achat en attente (stops des vendeurs et ordres d\'achat sur breakout). La SSL représente les ordres de vente en attente sous les creux. Le prix gravite souvent vers ces zones denses.',
            },
            {
              concept: 'Equal Highs (EQH) & Equal Lows (EQL)',
              explanation: 'Des sommets ou creux parfaitement alignés constituent des cibles de liquidité évidentes car de nombreux traders y placent leurs stops de protection.',
            },
          ],
          diagramSvg: 'smc_liquidity_diagram',
          takeaways: [
            'Les doubles sommets ou creux parfaits ne sont pas des barrières infranchissables, mais des réservoirs de liquidité.',
            'Entrer après le balayage (sweep) de la liquidité offre un stop loss plus court et un meilleur ratio R:R.',
          ],
          journalApplicationPrompt: 'Vérifiez dans votre journal si vos Take Profits sont positionnés juste avant ou après les zones de liquidité majeure.',
        },
        quiz: [
          {
            id: 'q1-3',
            question: 'Pourquoi les sommets alignés (Equal Highs) attirent-ils souvent le cours ?',
            options: [
              'Parce qu\'ils concentrent une grande densité d\'ordres stop d\'achat et d\'ordres d\'achat conditionnels.',
              'Parce que les indicateurs RSI y sont toujours en surachat.',
              'Parce que le spread y est systématiquement réduit à zéro.',
              'Parce que les courtiers forcent les prix sans raison.',
            ],
            correctIndex: 0,
            explanation: 'Exact. La forte concentration d\'ordres en attente au-dessus de ces sommets offre la contrepartie nécessaire aux flux de volume importants.',
          },
        ],
      },
      {
        id: 'smc-l3',
        number: 3,
        title: 'Analyse des Fausses Cassures & Sweeps de Liquidité',
        duration: '35 min',
        requiredTier: 'pro',
        summary: 'Reconnaître quand une cassure n\'est qu\'une prise de liquidité temporaire suivie d\'une réintégration rapide.',
        content: {
          introduction: 'Le piège classique de l\'analyse technique traditionnelle consiste à acheter une cassure de résistance au moment même où la liquidité acheteuse est absorbée. Comprendre le sweep permet d\'éviter ces entrées impulsives.',
          keyConcepts: [
            {
              concept: 'Le Sweep (Liquidity Grab)',
              explanation: 'Une incursion rapide au-delà d\'un niveau clé avec une mèche proéminente et une clôture immédiate à l\'intérieur de la zone de prix initiale.',
            },
            {
              concept: 'La Réintégration & Validation',
              explanation: 'Après le sweep, la confirmation intervient lorsque le cours casse la structure locale interne dans le sens inverse.',
            },
          ],
          diagramSvg: 'smc_sweep_diagram',
          takeaways: [
            'Ne pas confondre impulsion d\'extension et prise de liquidité.',
            'La réintégration immédiate sous le niveau cassé invalide le scénario de breakout classique.',
          ],
          journalApplicationPrompt: 'Notez dans votre journal combien de vos trades perdants étaient des achats sur le sommet d\'une bougie de cassure.',
        },
      },
      {
        id: 'smc-l4',
        number: 4,
        title: 'Confluence Multi-Timeframe & Contre-Exemples d\'Invalidation',
        duration: '40 min',
        requiredTier: 'premium',
        summary: 'Aligner la tendance de fond en Daily / 4H avec les déclencheurs de précision en 15m / 5m, et savoir quand abandonner un setup.',
        content: {
          introduction: 'Aucun concept technique ne fonctionne en vase clos. Un Order Block en 5 minutes qui s\'oppose à une tendance 4H agressive a une très forte probabilité d\'invalidation. La hiérarchie des unités de temps prévaut toujours.',
          keyConcepts: [
            {
              concept: 'Alignement HTF / LTF (High Timeframe to Low Timeframe)',
              explanation: 'Le biais directionnel est dicté par le 4H / Daily. L\'unité de temps intermédiaire (1H / 15m) cadre les zones clés. L\'unité d\'entrée (5m / 1m) permet de réduire le risque initial.',
            },
            {
              concept: 'Critères stricts d\'invalidation',
              explanation: 'Une clôture de corps de bougie au-delà de la zone de rejet invalide immédiatement le setup. Tout maintien obstiné de position viole la gestion du risque.',
            },
          ],
          diagramSvg: 'smc_mtf_diagram',
          takeaways: [
            'Toujours trader dans le sens de la structure HTF majeure.',
            'L\'invalidation rapide est une protection, pas un échec personnel.',
          ],
          journalApplicationPrompt: 'Sur vos 10 derniers trades, combien étaient parfaitement alignés avec la tendance 4H ?',
        },
      },
    ],
  },

  // ==========================================================================
  // MODULE 2 : PROP FIRMS & DRAWDOWN
  // ==========================================================================
  {
    id: 'prop-firms',
    title: 'Méthodes & Simulations pour Prop Firms',
    subtitle: 'Comprendre et maîtriser les règles de drawdown quotidien et global, simulations de pertes et gestion du capital financé',
    category: 'Prop Firms',
    level: 'Avancé',
    duration: '1h 45m',
    lessonsCount: 4,
    freeLessonsCount: 1,
    badge: 'Gestion Sous Contrat',
    accentColor: '#3B82F6', // Blue
    coverSvg: 'prop_cover',
    description: 'Une étude détaillée des mécanismes d\'évaluation (FTMO, Topstep, etc.). Aucune méthode n\'est mathématiquement infaillible, mais une stricte gestion du risque asymétrique et la compréhension du trailing drawdown maximisent vos probabilités de survie.',
    whyItMatters: 'Plus de 90% des échecs en prop firms sont dus à la violation du Daily Drawdown lors d\'une seule journée de frustration ou de sur-levier.',
    calculatorId: 'propfirm-drawdown',
    journalAuditCriteria: [
      {
        metricChecked: 'Perte Maximale sur une Journée',
        benchmark: 'Max Daily Loss < 2.0% du capital',
        description: 'Vérifie si vous n\'avez jamais approché le seuil d\'élimination quotidien (généralement 4% à 5%).',
      },
      {
        metricChecked: 'Respect du Risque Moyen par Trade',
        benchmark: 'Risque moyen ≤ 0.5% du compte',
        description: 'Mesure la modération de vos tailles de position face aux exigences des firmes financées.',
      },
    ],
    lessons: [
      {
        id: 'prop-l1',
        number: 1,
        title: 'Décryptage Mathématique des Règles de Drawdown (Daily vs Trailing)',
        duration: '25 min',
        requiredTier: 'free',
        summary: 'Comprendre exactement comment les plateformes calculent votre limite de perte journalière et pourquoi le trailing drawdown piège les traders imprudents.',
        content: {
          introduction: 'Les prop firms ne sont pas des banques de bienfaisance : leurs règles sont conçues autour de contraintes de risque très strictes. Pour survivre, vous devez comprendre au dollar près comment est calculé votre seuil d\'élimination.',
          keyConcepts: [
            {
              concept: 'Max Daily Drawdown (Perte Quotidienne Maximale)',
              explanation: 'Généralement fixé à 5% de la balance initiale ou de la balance à minuit (UTC/serveur). Si vos positions ouvertes et clôturées font chuter l\'équité sous ce seuil à n\'importe quel instant de la journée, le compte est instantanément disqualifié.',
              counterExample: 'Attention : le calcul prend en compte le Floating P&L (perte latente). Même si vous ne fermez pas le trade, une mèche défavorable qui touche le seuil clôture votre compte.',
            },
            {
              concept: 'Trailing Drawdown vs Static Drawdown',
              explanation: 'Le drawdown statique reste fixe par rapport au capital de départ. Le trailing drawdown monte au fur et à mesure que vous enregistrez des profits (parfois même sur le plus haut flottant), ce qui réduit la marge d\'erreur si vous ne sécurisez pas vos gains.',
              counterExample: 'Un compte de 100 000 $ avec 10% de trailing drawdown qui monte à 106 000 $ voit son plancher d\'invalidation remonter à 96 000 $. La perte tolérée ne repart pas de zéro.',
            },
            {
              concept: 'Objectif de profit vs Risque Réel',
              explanation: 'Viser 8% ou 10% de profit avec une limite de perte maximale de 10% impose un ratio d\'espérance équilibré. Essayer de passer le challenge en 3 jours en risquant 2% par trade mène statistiquement à la destruction du compte.',
            },
          ],
          diagramSvg: 'prop_drawdown_diagram',
          takeaways: [
            'Le Daily Drawdown inclut les pertes latentes (flottantes), pas seulement les pertes clôturées.',
            'Calculez votre perte tolérée chaque matin à l\'ouverture avant de placer le premier ordre.',
            'Aucune règle de gestion ne garantit la réussite, mais risquer 0.5% par trade permet d\'encaisser 10 pertes consécutives sans violer la limite quotidienne.',
          ],
          journalApplicationPrompt: 'Vérifiez sur votre pire journée enregistrée si vos pertes cumulées auraient violé un Daily Drawdown de 4%.',
        },
        quiz: [
          {
            id: 'q2-1',
            question: 'Si votre compte démarre la journée à 100 000 $ avec une règle de Daily Drawdown de 5% (seuil à 95 000 $), et que vous avez un trade flottant à -5 200 $ non clôturé :',
            options: [
              'Le compte reste valide tant que le trade n\'est pas fermé à la fin de la journée.',
              'Le compte est immédiatement en infraction et clôturé par le gestionnaire de risque de la firme.',
              'Le seuil est automatiquement reporté au lendemain.',
              'La firme vous envoie un avertissement sans sanction.',
            ],
            correctIndex: 1,
            explanation: 'Exact ! Dans la quasi-totalité des prop firms modernes, le Daily Loss Limit est contrôlé en temps réel sur l\'équité flottante (equity-based). Une perte latente supérieure au seuil élimine le compte instantanément.',
          },
          {
            id: 'q2-2',
            question: 'Quelle taille de risque par trade est la plus adaptée pour préserver un compte d\'évaluation prop firm ?',
            options: [
              '2% à 3% pour passer le test le plus vite possible.',
              '0.25% à 0.5% afin de supporter sereinement une séquence statistique de plusieurs pertes consécutives.',
              '10% sur un seul trade à haute conviction.',
              'Un montant variable décidé à l\'intuition selon la forme du jour.',
            ],
            correctIndex: 1,
            explanation: 'Très bien. Risquer 0.5% maximum par trade permet d\'absorber 4 à 6 pertes dans une même session sans jamais risquer d\'atteindre les 4-5% fatidiques du Max Daily Drawdown.',
          },
        ],
      },
      {
        id: 'prop-l2',
        number: 2,
        title: 'Dimensionnement Asymétrique (0.25% - 0.5%) & Gestion des Séries de Pertes',
        duration: '25 min',
        requiredTier: 'pro',
        summary: 'Comment structurer vos positions pour qu\'une série de 5 pertes d\'affilée ne représente que 2.5% de baisse de capital.',
        content: {
          introduction: 'Le pire ennemi du candidat prop firm est la variance statistique. Même avec une stratégie gagnante à 55% de win rate, subir 5 à 7 pertes d\'affilée au cours d\'un échantillon de 100 trades est mathématiquement certain.',
          keyConcepts: [
            {
              concept: 'L\'asymétrie de capitalisation',
              explanation: 'En risquant 0.5% pour viser 1.5R à 2R, une seule victoire efface 3 à 4 pertes. Cela vous permet d\'évoluer sereinement sans stress de compte.',
            },
            {
              concept: 'L\'adaptation de la taille après gain / perte',
              explanation: 'Réduire le risque de moitié (à 0.25%) dès que le compte subit deux pertes consécutives dans la même semaine protège le coussin de drawdown.',
            },
          ],
          diagramSvg: 'prop_risk_sizing_diagram',
          takeaways: [
            'Ne jamais augmenter sa taille de position pour rattraper une perte.',
            'L\'adaptation défensive en période de drawdown préserve l\'accès au capital financé.',
          ],
          journalApplicationPrompt: 'Calculez quel aurait été votre résultat mensuel si vous aviez plafonné chaque trade à exactement 0.5% de risque.',
        },
      },
      {
        id: 'prop-l3',
        number: 3,
        title: 'La Règle d\'Arrêt Journalière & Protection du Buffer de Profit',
        duration: '25 min',
        requiredTier: 'pro',
        summary: 'Mettre en place un circuit coupe-feu strict : 2 pertes consécutives = arrêt immédiat de la session.',
        content: {
          introduction: 'Les meilleurs gérants sous contrat ne s\'obstinent jamais. S\'ils subissent deux pertes dans une même session, ils ferment leurs écrans. Cette discipline empêche le revenge trading de détruire des semaines de travail régulier.',
          keyConcepts: [
            {
              concept: 'Le circuit-breaker opérationnel',
              explanation: 'Une règle d\'engagement écrite : après 2 pertes ou dès -1.5% sur la journée, interdiction absolue de réouvrir un trade avant le lendemain.',
            },
            {
              concept: 'La protection du buffer de profit',
              explanation: 'Une fois en profit de +4%, les gains ne doivent plus être risqués au même rythme. On réduit la voilure pour sécuriser la validation finale.',
            },
          ],
          diagramSvg: 'prop_circuit_breaker_diagram',
          takeaways: [
            'L\'arrêt après 2 pertes est une règle de survie, pas un aveu d\'impuissance.',
            'Le marché sera toujours là demain ; votre compte de prop firm, lui, peut disparaître aujourd\'hui.',
          ],
          journalApplicationPrompt: 'Identifiez dans votre historique combien de journées ont tourné au désastre après le troisième trade de la journée.',
        },
      },
      {
        id: 'prop-l4',
        number: 4,
        title: 'Simulations Avancées de Scénarios de Stress & Passage d\'Évaluation',
        duration: '30 min',
        requiredTier: 'premium',
        summary: 'Simulez 500 parcours aléatoires de challenges prop firms selon votre propre win rate et votre ratio R:R réel.',
        content: {
          introduction: 'Grâce aux simulations de Monte Carlo, vous pouvez modéliser la probabilité mathématique exacte de valider votre challenge ou d\'échouer en fonction de vos paramètres d\'exécution réels.',
          keyConcepts: [
            {
              concept: 'Simulation de séquençage aléatoire',
              explanation: 'Même avec un edge positif, l\'ordre d\'apparition des victoires et des défaites détermine si vous franchirez le seuil de profit avant de toucher le drawdown.',
            },
            {
              concept: 'Gestion du temps imparti vs compte sans limite',
              explanation: 'Pourquoi les comptes modernes sans contrainte de temps favorisent la patience et rendent le sur-trading inutile.',
            },
          ],
          diagramSvg: 'prop_monte_carlo_diagram',
          takeaways: [
            'Prendre son temps réduit drastiquement la probabilité de ruine.',
            'Votre journal est votre unique boussole pour calibrer vos simulations.',
          ],
          journalApplicationPrompt: 'Comparez votre espérance par trade enregistrée à l\'objectif nécessaire pour atteindre 8% de gain.',
        },
      },
    ],
  },

  // ==========================================================================
  // MODULE 3 : PSYCHOLOGIE DE L'EXÉCUTION
  // ==========================================================================
  {
    id: 'psychology-execution',
    title: 'Psychologie de l\'Exécution & Biais Comportementaux',
    subtitle: 'Neutraliser le FOMO, éliminer le revenge trading et relier vos routines aux données réelles de votre journal',
    category: 'Psychologie',
    level: 'Débutant',
    duration: '1h 30m',
    lessonsCount: 4,
    freeLessonsCount: 1,
    badge: 'Discipline Émotionnelle',
    accentColor: '#8B5CF6', // Purple
    coverSvg: 'psy_cover',
    description: 'Une approche comportementale pragmatique connectée à vos résultats. Loin des poncifs abstraits, nous mesurons concrètement l\'impact financier du FOMO, de l\'impatience et du manque de discipline à partir de vos propres données enregistrées.',
    whyItMatters: 'Un trader techniquement moyen mais d\'une rigueur absolue sera toujours rentable, alors qu\'un expert des graphiques incapable de maîtriser ses impulsions finira ruiné.',
    calculatorId: 'psychology-drift',
    journalAuditCriteria: [
      {
        metricChecked: 'Score Moyen de Discipline',
        benchmark: 'Score moyen ≥ 8.0 / 10',
        description: 'Vérifie si vous respectez vos critères d\'entrée et votre plan pré-établi.',
      },
      {
        metricChecked: 'Trades Impulsifs (FOMO / Revenge)',
        benchmark: 'Taux de trades avec biais < 10%',
        description: 'Scanne vos tags émotionnels pour isoler le coût financier des décisions non planifiées.',
      },
    ],
    lessons: [
      {
        id: 'psy-l1',
        number: 1,
        title: 'Le Cycle Émotionnel du Trader : Euphorie, Peur et Biais de Récence',
        duration: '20 min',
        requiredTier: 'free',
        summary: 'Comprendre pourquoi notre cerveau est biologiquement programmé pour faire exactement l\'inverse de ce qu\'exige le trading rentable.',
        content: {
          introduction: 'Le cerveau humain recherche la sécurité, la validation immédiate et la conformité sociale. Sur les marchés financiers, ces mécanismes de survie ancestraux déclenchent l\'achat au plus haut (euphorie/FOMO) et la panique au plus bas.',
          keyConcepts: [
            {
              concept: 'Le biais de récence (Recency Bias)',
              explanation: 'La tendance à surpondérer les 3 derniers trades dans nos décisions. Après 3 gains consécutifs, on se sent invincible et on augmente déraisonnablement le risque ; après 3 pertes, on hésite sur un setup parfait par peur de souffrir à nouveau.',
              counterExample: 'Rappel statistique : le résultat d\'un trade individuel est totalement indépendant des trades précédents si votre stratégie repose sur un échantillon significatif.',
            },
            {
              concept: 'L\'aversion à la perte (Kahneman & Tversky)',
              explanation: 'La douleur psychologique d\'une perte de 500 $ est ressentie avec une intensité deux fois supérieure au plaisir d\'un gain équivalent. C\'est ce biais qui pousse à déplacer son Stop Loss pour refuser d\'encaisser la perte.',
            },
            {
              concept: 'La perte comme coût opérationnel',
              explanation: 'Un commerçant paie son loyer et son électricité pour ouvrir son magasin. Pour un trader, une perte normale respectant le risque est simplement le coût d\'exploitation nécessaire pour capter les trades gagnants.',
            },
          ],
          diagramSvg: 'psy_emotional_cycle_diagram',
          takeaways: [
            'Chaque trade n\'est qu\'une distribution statistique dans une série de 100.',
            'Déplacer son stop loss pour éviter d\'avoir tort transforme une perte contrôlée en catastrophe de compte.',
            'Le calme émotionnel découle d\'un risque unitaire si faible qu\'aucune perte ne peut vous perturber.',
          ],
          journalApplicationPrompt: 'Sur vos trades avec un score de discipline inférieur à 6, combien ont résulté d\'un refus d\'accepter une petite perte initiale ?',
        },
        quiz: [
          {
            id: 'q3-1',
            question: 'Que traduit le biais de récence chez un trader venant d\'enchaîner 4 trades gagnants ?',
            options: [
              'Une preuve formelle que sa stratégie ne perdra plus jamais.',
              'Une illusion de contrôle qui incite souvent à augmenter la taille de ses positions sans justification mathématique.',
              'Une baisse naturelle de la volatilité des marchés.',
              'Une obligation imposée par le courtier de retirer ses profits.',
            ],
            correctIndex: 1,
            explanation: 'Exactement. Après une série gagnante, le biais de récence provoque un excès de confiance (hubris) souvent suivi d\'une prise de risque disproportionnée.',
          },
          {
            id: 'q3-2',
            question: 'Comment un trader professionnel conçoit-il une position arrêtée sur son Stop Loss initial ?',
            options: [
              'Comme une défaite personnelle humiliante qu\'il doit venger immédiatement.',
              'Comme un coût opérationnel standard inhérent au modèle probabiliste de son activité.',
              'Comme une faute technique systématique de son analyse.',
              'Comme une preuve que les marchés sont manipulés contre lui.',
            ],
            correctIndex: 1,
            explanation: 'Très juste. Tout comme un restaurant achète des ingrédients avec une marge de perte normale, le trader accepte les stops comme des frais de fonctionnement prévisibles.',
          },
        ],
      },
      {
        id: 'psy-l2',
        number: 2,
        title: 'Identifier et Neutraliser le FOMO et le Revenge Trading',
        duration: '25 min',
        requiredTier: 'pro',
        summary: 'Détecter les signaux physiques et mentaux qui précèdent une prise de position impulsive non planifiée.',
        content: {
          introduction: 'Le revenge trading (chercher à récupérer immédiatement une perte) et le FOMO (peur de rater le mouvement) sont responsables de l\'immense majorité des faillites de comptes particuliers.',
          keyConcepts: [
            {
              concept: 'L\'anatomie du Revenge Trading',
              explanation: 'Prendre un trade 3 minutes après avoir été stoppé, avec une taille doublée, sans setup structuré, dans l\'unique but d\'effacer la douleur de la perte.',
            },
            {
              concept: 'Le protocole de désescalade',
              explanation: 'Quitter physiquement la pièce pendant 10 minutes après toute perte supérieure au risque normal, respirer et consigner son ressenti dans le journal.',
            },
          ],
          diagramSvg: 'psy_revenge_loop_diagram',
          takeaways: [
            'Le marché ne vous doit rien personnellement.',
            'Tout trade pris sous le coup de la colère a une espérance mathématique négative.',
          ],
          journalApplicationPrompt: 'Filtrez vos trades marqués avec l\'émotion "Revenge" : quel est votre taux de perte cumulé sur ces exécutions ?',
        },
      },
      {
        id: 'psy-l3',
        number: 3,
        title: 'La Routine Pré-Session de 15 Minutes & Checklist d\'Exécution',
        duration: '20 min',
        requiredTier: 'pro',
        summary: 'Comment se conditionner mentalement avant chaque session de trading avec une checklist sans concession.',
        content: {
          introduction: 'Les athlètes de haut niveau ne rentrent jamais sur le terrain sans échauffement. Le trader professionnel doit auditer son état de fatigue, vérifier les annonces économiques et définir ses scénarios avant d\'allumer la plateforme.',
          keyConcepts: [
            {
              concept: 'La checklist en 5 points',
              explanation: '1. Calendrier économique vérifié ? 2. Niveau d\'énergie suffisant ? 3. Risque max de la session défini ? 4. Niveaux clés tracés sur unité HTF ? 5. Acceptation sereine de ne pas trader si aucun setup ne se présente.',
            },
          ],
          diagramSvg: 'psy_routine_diagram',
          takeaways: [
            'Ne pas trader est une décision de trading à part entière.',
            'La préparation élimine 80% des décisions impulsives en séance.',
          ],
          journalApplicationPrompt: 'Avez-vous suivi une routine écrite avant votre séance d\'hier ?',
        },
      },
      {
        id: 'psy-l4',
        number: 4,
        title: 'Journaling Émotionnel & Détection Automatisée des Écarts au Plan',
        duration: '25 min',
        requiredTier: 'premium',
        summary: 'Relier l\'intelligence de TRADEIQ à vos patterns comportementaux pour bloquer vos fuites de capital récurrentes.',
        content: {
          introduction: 'Votre journal TRADEIQ n\'est pas un carnet de notes passif : il quantifie précisément vos habitudes. Il vous indique quel jour, à quelle heure ou après quelle émotion vous perdez le plus d\'argent.',
          keyConcepts: [
            {
              concept: 'La corrélation émotion / rentabilité',
              explanation: 'Croiser les émotions consignées (Calme, Confiant, Anxieux, FOMO) avec le P&L net et le R-multiple réalisé.',
            },
            {
              concept: 'La suppression des fuites (Leak Elimination)',
              explanation: 'Améliorer son trading ne consiste souvent pas à trouver plus de gagnants, mais à supprimer les 3 comportements toxiques qui détruisent vos profits.',
            },
          ],
          diagramSvg: 'psy_leak_elimination_diagram',
          takeaways: [
            'Ce qui se mesure s\'améliore.',
            'Le trader d\'élite affine son comportement grâce aux statistiques objectives.',
          ],
          journalApplicationPrompt: 'Consultez votre onglet Psychologie dans TRADEIQ : quel est votre P&L moyen lorsque vous tradez en état de calme vs en état d\'anxiété ?',
        },
      },
    ],
  },

  // ==========================================================================
  // MODULE 4 : GESTION DU RISQUE & ESPÉRANCE
  // ==========================================================================
  {
    id: 'risk-management',
    title: 'Gestion du Risque, Espérance & Probabilités',
    subtitle: 'Modélisation de l\'espérance mathématique, asymétrie gain/perte, probabilités de ruine et dimensionnement exact',
    category: 'Risk Management',
    level: 'Intermédiaire',
    duration: '1h 30m',
    lessonsCount: 4,
    freeLessonsCount: 1,
    badge: 'Priorité Absolue',
    accentColor: '#F59E0B', // Amber
    coverSvg: 'risk_cover',
    description: 'Le cœur de l\'avantage quantitatif. Comprendre pourquoi un trader avec 40% de taux de réussite peut accumuler une fortune tandis qu\'un trader à 80% de win rate peut tout perdre en un seul trade. Calculateurs interactifs et tableaux de survie inclus.',
    whyItMatters: 'Sans espérance mathématique positive et sans gestion du risque de ruine, toute stratégie technique est condamnée à l\'échec statistique sur le long terme.',
    calculatorId: 'risk-expectancy',
    journalAuditCriteria: [
      {
        metricChecked: 'Espérance Mathématique Réalisée (E)',
        benchmark: 'Espérance E > 0.35R par trade',
        description: 'Calcule l\'espérance réelle générée par trade sur l\'ensemble de votre historique.',
      },
      {
        metricChecked: 'Ratio Gain Moyen / Perte Moyenne',
        benchmark: 'Profit Factor ≥ 1.5 & Win/Loss ≥ 1.5',
        description: 'Vérifie que vos gains compensent largement vos pertes inévitables.',
      },
    ],
    lessons: [
      {
        id: 'risk-l1',
        number: 1,
        title: 'L\'Espérance Mathématique Positive : Le Paradoxe Win Rate vs R-Multiple',
        duration: '20 min',
        requiredTier: 'free',
        summary: 'Démonstration mathématique de l\'équation de rentabilité et pourquoi le taux de réussite isolé ne signifie rien sans le ratio R.',
        content: {
          introduction: 'Dans l\'imaginaire collectif, être un bon trader signifie "avoir raison 9 fois sur 10". Dans la réalité institutionnelle et quantitative, le taux de réussite n\'est que la moitié de l\'équation. L\'espérance mathématique est le seul juge de paix.',
          keyConcepts: [
            {
              concept: 'L\'Équation de l\'Espérance (Expected Value)',
              explanation: 'E = (Win Rate × Gain Moyen) - (Loss Rate × Perte Moyenne). Si E est positif, le compte croît mathématiquement au fur et à mesure que le nombre d\'exécutions augmente.',
              counterExample: 'Exemple frappant : un trader avec 85% de win rate qui gagne 50 $ par trade gagnant, mais perd 500 $ quand il a tort (car il refuse de couper son stop) a une espérance négative : (0.85 × 50) - (0.15 × 500) = 42.50 - 75 = -32.50 $ par trade ! Il est condamné à la faillite.',
            },
            {
              concept: 'Le modèle des 40% de réussite rentable',
              explanation: 'Un trader qui ne gagne que 40 fois sur 100, mais dont le gain moyen est de 2.5R (250 $) pour un risque de 1R (100 $) génère : (0.40 × 250) - (0.60 × 100) = 100 - 60 = +40 $ par trade ! Il est largement rentable sur la durée.',
            },
            {
              concept: 'La loi des grands nombres',
              explanation: 'L\'espérance ne se vérifie pas sur 3 ou 5 trades, mais sur des blocs de 30, 50 ou 100 trades rigoureusement exécutés selon les mêmes règles.',
            },
          ],
          diagramSvg: 'risk_expectancy_matrix_diagram',
          takeaways: [
            'Ne cherchez pas à avoir raison à chaque trade, cherchez à exécuter des opportunités à espérance positive.',
            'Accepter un taux de réussite modeste (40% - 50%) libère d\'une immense pression psychologique.',
            'Votre journal TRADEIQ calcule automatiquement votre espérance réelle dans l\'onglet Dashboard.',
          ],
          journalApplicationPrompt: 'Vérifiez votre propre espérance mathématique sur le Dashboard TRADEIQ : est-elle positive ? Quel est votre R-multiple moyen ?',
        },
        quiz: [
          {
            id: 'q4-1',
            question: 'Un trader réalise 40% de trades gagnants avec un R-multiple moyen de 2.5R (gain de 250 $ pour 100 $ de risque). Quelle est son espérance par trade ?',
            options: [
              '-10 $ par trade (non rentable car win rate inférieur à 50%).',
              '+40 $ par trade (hautement rentable sur le long terme).',
              '0 $ (pile à l\'équilibre).',
              '+150 $ par trade.',
            ],
            correctIndex: 1,
            explanation: 'Bravo ! Formule : (0.40 × 250 $) - (0.60 × 100 $) = 100 $ - 60 $ = +40 $ nets par exécution. Ce trader enrichit son capital de manière robuste malgré 60% d\'échecs.',
          },
          {
            id: 'q4-2',
            question: 'Pourquoi un taux de réussite de 85% peut-il conduire à la ruine complète ?',
            options: [
              'Parce que le courtier bloque les comptes qui ont trop de trades gagnants.',
              'Si les 15% de trades perdants coûtent 10 fois plus cher que les gains moyens en raison de l\'absence de stop loss.',
              'Parce que les marchés n\'acceptent que des win rates inférieurs à 60%.',
              'C\'est impossible, un compte à 85% de win rate gagne toujours.',
            ],
            correctIndex: 1,
            explanation: 'Exact. C\'est le piège classique des stratégies de martingales ou de refus de perte : 10 petits gains de 50 $ effacés par une seule perte de 1 000 $. L\'espérance est négative.',
          },
        ],
      },
      {
        id: 'risk-l2',
        number: 2,
        title: 'Calcul Précis de la Taille de Position & Risque Fixe vs Pourcentage',
        duration: '25 min',
        requiredTier: 'pro',
        summary: 'Maîtriser la formule de dimensionnement exacte en fonction de la distance du Stop Loss pour ne jamais improviser sa taille de lot.',
        content: {
          introduction: 'Choisir sa taille de position au hasard ou toujours utiliser le même nombre de lots (ex: "je trade 1 lot") est une erreur fondamentale. La taille de lot doit être le résultat mathématique strict de votre distance de stop loss.',
          keyConcepts: [
            {
              concept: 'La Formule du Dimensionnement',
              explanation: 'Taille de position = Montant du Risque $ / (Distance du Stop Loss en Pips/Ticks × Valeur du Pip). Ainsi, que votre stop soit de 10 pips ou de 40 pips, votre perte maximale reste rigoureusement identique.',
            },
            {
              concept: 'Risque fixe en $ vs Risque en % du capital',
              explanation: 'Le risque en pourcentage (ex: 1% du capital actuel) permet d\'ajuster automatiquement la taille lors des phases de croissance ou de baisse.',
            },
          ],
          diagramSvg: 'risk_position_sizing_diagram',
          takeaways: [
            'Le Stop Loss détermine la taille du lot, et non l\'inverse.',
            'Ne risquez jamais une taille de lot arbitraire.',
          ],
          journalApplicationPrompt: 'Comparez le risque en dollars pris sur vos 5 derniers trades : était-il constant ou fluctuait-il de manière anarchique ?',
        },
      },
      {
        id: 'risk-l3',
        number: 3,
        title: 'Séries de Pertes Inévitables, Asymétrie des Drawdowns & Risque de Ruine',
        duration: '25 min',
        requiredTier: 'pro',
        summary: 'Comprendre pourquoi une baisse de -50% nécessite +100% de gain pour revenir à zéro, et comment la table de survie vous protège.',
        content: {
          introduction: 'Les pertes ont un coût asymétrique destructeur. Plus le drawdown s\'approfondit, plus l\'effort nécessaire pour reconstituer le capital devient mathématiquement insurmontable.',
          keyConcepts: [
            {
              concept: 'L\'asymétrie de récupération',
              explanation: 'Une perte de 10% nécessite 11.1% de gain pour récupérer. Une perte de 20% nécessite 25%. Une perte de 50% nécessite 100%. Une perte de 80% nécessite 400% de profit juste pour revenir à zéro !',
            },
            {
              concept: 'La probabilité des séries de pertes',
              explanation: 'Même avec 60% de réussite, la probabilité d\'aligner 6 pertes consécutives sur une série de 100 trades est supérieure à 30%. Votre taille de risque doit être calibrée pour survivre sans broncher à cette série.',
            },
          ],
          diagramSvg: 'risk_drawdown_recovery_diagram',
          takeaways: [
            'La préservation du capital prime sur la recherche du gain.',
            'Limiter les pertes permet de ne jamais tomber dans la zone d\'asymétrie fatale.',
          ],
          journalApplicationPrompt: 'Calculez quel est votre plus grand drawdown historique et le pourcentage de rebond qu\'il a nécessité.',
        },
      },
      {
        id: 'risk-l4',
        number: 4,
        title: 'Modélisation Monte Carlo & Gestion Dynamique du Risque',
        duration: '25 min',
        requiredTier: 'premium',
        summary: 'Exploiter la simulation stochastique pour stresser votre stratégie et mesurer le risque de ruine réel de votre modèle.',
        content: {
          introduction: 'En réordonnant aléatoirement 1 000 fois vos trades passés, la simulation Monte Carlo révèle le pire scénario de drawdown auquel vous pouvez vous attendre dans les prochains mois.',
          keyConcepts: [
            {
              concept: 'L\'intervalle de confiance à 95%',
              explanation: 'Identifier la baisse maximale probable de votre compte avec un niveau de confiance statistique robuste.',
            },
            {
              concept: 'Ajustement dynamique du risque',
              explanation: 'Adapter sa taille d\'engagement en fonction de la volatilité de marché et des métriques de drawdowns en cours.',
            },
          ],
          diagramSvg: 'risk_monte_carlo_diagram',
          takeaways: [
            'Les marchés alternent régimes calmes et clusters de volatilité.',
            'Utilisez l\'onglet Stress Test de TRADEIQ pour auditer vos données.',
          ],
          journalApplicationPrompt: 'Lancez le Stress Test Monte Carlo dans TRADEIQ sur vos données de trades pour visualiser votre courbe de drawdown à 95%.',
        },
      },
    ],
  },
];
