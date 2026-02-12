// Mom's Investment Journey Data Model

export interface LessonContentBlock {
  type: "warm_intro" | "core_concept" | "guided_example";
  text: string;
}

export interface InteractiveTask {
  task_id: string;
  type:
    | "slider"
    | "money_input"
    | "quick_calc"
    | "mini_plan_builder"
    | "comparison_picker"
    | "scenario_choice"
    | "number_input"
    | "multi_choice";
  title: string;
  description?: string;
  hint?: string;
  helper_text?: string;
  fields?: any[];
  inputs?: string[];
  outputs?: any[];
  items?: any[];
  scenario?: string;
  options?: any[];
  validation?: any;
  save_to?: string;
}

export interface QuizQuestion {
  id: string;
  type: "multi_choice" | "true_false";
  prompt: string;
  options?: string[];
  answer_index?: number;
  answer?: boolean;
  explanation: string;
}

export interface Lesson {
  lesson_id: string;
  title: string;
  duration: string;
  objective: string;
  isPremium?: boolean;
  content_blocks?: LessonContentBlock[];
  interactive_tasks?: InteractiveTask[];
  quiz?: { questions: QuizQuestion[] };
}

export interface Module {
  module_id: string;
  title: string;
  lessons: Lesson[];
}

export interface CourseLevel {
  level_id: "beginner" | "intermediate" | "advanced";
  title: string;
  goal: string;
  modules: Module[];
}

export const QUIZ_PASSING_PERCENT = 60;

type TaskType = InteractiveTask["type"];

type LessonSeed = {
  id: string;
  title: string;
  duration: string;
  objective: string;
  taskType: TaskType;
};

const BEGINNER_CONTENT: Record<string, LessonContentBlock[]> = {
  b1_l1_money_without_shame: [
    {
      type: "warm_intro",
      text: "Money stress often feels personal, but in reality it is usually a system problem, not a character problem. If your week is packed with childcare, work, and mental load, it is normal to feel overwhelmed by numbers. This lesson is here to remove shame and give you a calmer starting point.",
    },
    {
      type: "core_concept",
      text: "You do not need a perfect plan to make progress. A repeatable 10-minute weekly routine is usually stronger than long, exhausting sessions that happen once a month. Consistency creates clarity, and clarity lowers anxiety because you can see what is happening instead of guessing.",
    },
    {
      type: "guided_example",
      text: "Start with one sentence: \"My biggest money worry right now is...\" Then write one next action that takes under 10 minutes. For example: check account balance, list two fixed bills, or set one reminder. Tiny completed actions reduce stress faster than big plans you cannot maintain.",
    },
    {
      type: "core_concept",
      text: "Think of this as emotional budgeting first: less panic, more structure. When your nervous system is calmer, decisions become better. The goal is not to do everything today. The goal is to stay in control long enough to improve week by week.",
    },
    {
      type: "guided_example",
      text: "A practical weekly script: 1) What came in? 2) What went out? 3) What is one adjustment for next week? Keep this script simple and repeat it. Over time, this becomes your personal anti-stress system.",
    },
  ],
  b1_l2_cashflow_map: [
    {
      type: "warm_intro",
      text: "If budgeting feels confusing, do not start with perfect categories. Start with a map. A map gives orientation: what comes in, what goes out, and what remains. Once you can see the flow, better decisions become much easier.",
    },
    {
      type: "core_concept",
      text: "Cashflow clarity means decisions become less emotional and more practical. When your income and expenses are visible in one place, you can protect essentials first, then adjust flexible spending without panic. Visibility is the first layer of financial control.",
    },
    {
      type: "guided_example",
      text: "Write monthly income at the top. List fixed costs next: rent, utilities, childcare, transport. Then add estimated flexible categories like groceries and household supplies. Whatever remains is your planning space for goals, buffer, and breathing room.",
    },
    {
      type: "core_concept",
      text: "Many households feel broke not because income is too low, but because timing is chaotic. Mapping cashflow helps you spot timing pressure, for example when big bills cluster in one week. Once identified, you can plan around that pressure.",
    },
    {
      type: "guided_example",
      text: "Use this check each week: \"Did this expense surprise me, or was it predictable?\" If predictable, move it into your map so next month is easier. Over a few weeks, surprises drop and confidence rises.",
    },
  ],
  b2_l1_simple_budget_method: [
    {
      type: "warm_intro",
      text: "A useful budget should support your real life, not punish you for being human. Kids, school events, and tired evenings are part of reality. A flexible system that survives imperfect weeks is better than a strict system that collapses after one disruption.",
    },
    {
      type: "core_concept",
      text: "Use three buckets: Essentials, Life/Flex, and Future. Essentials protect housing and core obligations. Life/Flex handles variable, everyday needs. Future receives consistent contributions for safety, savings, and investing. This keeps decisions simple under pressure.",
    },
    {
      type: "guided_example",
      text: "Example split: 60% Essentials, 30% Life/Flex, 10% Future. Your exact percentages can differ, and that is okay. The important part is keeping the three-bucket structure stable so you always know where to adjust first.",
    },
    {
      type: "core_concept",
      text: "When money feels tight, reduce friction by pre-deciding tradeoffs. Decide in advance what moves down first when pressure rises, for example takeout or non-essential subscriptions. Pre-decisions prevent stress-driven overspending.",
    },
    {
      type: "guided_example",
      text: "Run a monthly reset: keep Essentials stable, trim one Life/Flex area by a small amount, and protect Future even if it is a small transfer. The message is consistency over intensity.",
    },
  ],
  b2_l2_unit_prices: [
    {
      type: "warm_intro",
      text: "Smart shopping is not about constant sacrifice. It is about getting better value on items your household already needs. This creates savings without feeling like deprivation, which makes the habit easier to keep long term.",
    },
    {
      type: "core_concept",
      text: "Compare by unit price, not by package price. The lowest shelf price can be misleading if quantity differs. Unit pricing (per 100g, per kg, per liter) gives an apples-to-apples comparison and usually leads to better decisions quickly.",
    },
    {
      type: "guided_example",
      text: "Example: item A costs 2.40 for 400g, item B costs 3.00 for 600g. Item B looks more expensive, but may be cheaper per 100g. This one shift in thinking can reduce grocery spend over time without changing your family routine.",
    },
    {
      type: "core_concept",
      text: "Unit price decisions compound over months. A few smarter choices each week can create a meaningful annual difference, especially in frequently purchased categories like pantry items, cleaning products, and basics.",
    },
    {
      type: "guided_example",
      text: "Pick three categories this week where you will always check unit price first. Keep it lightweight. Repeating this in only a few categories is enough to build a strong money-saving reflex.",
    },
  ],
  b3_l1_emergency_fund: [
    {
      type: "warm_intro",
      text: "Emergency savings are not wasted money. They are stress protection. Unexpected repairs, school costs, or income interruptions become less damaging when you have even a modest cash buffer in place.",
    },
    {
      type: "core_concept",
      text: "Start with a realistic first milestone, then scale gradually. A small starter cushion can prevent high-interest debt during surprises. You are not trying to build the full buffer overnight. You are building financial shock absorption step by step.",
    },
    {
      type: "guided_example",
      text: "Starter milestones could be 300, 500, or one week of essentials. Choose one number and name the goal clearly. Naming a goal and assigning one transfer this week turns intention into action.",
    },
    {
      type: "core_concept",
      text: "The emotional win matters: every time an unexpected cost is covered without panic, your confidence grows. Emergency funds reduce both financial damage and decision fatigue during difficult moments.",
    },
    {
      type: "guided_example",
      text: "Set one trigger rule: after each income payment, move a fixed amount to emergency savings first. Even a small automated amount protects progress and reduces reliance on willpower.",
    },
  ],
  b3_l2_automate_saving: [
    {
      type: "warm_intro",
      text: "Automation removes daily decision fatigue. If every transfer needs motivation, consistency drops. The easier your system is, the more likely you keep it going through busy or stressful weeks.",
    },
    {
      type: "core_concept",
      text: "Use a default amount and a fallback amount. On strong months, use default. On tighter months, use fallback instead of stopping. This prevents the all-or-nothing pattern that usually breaks long-term progress.",
    },
    {
      type: "guided_example",
      text: "Example: default 100 monthly, fallback 25 monthly. The exact values are not the point. The point is preserving momentum. A smaller transfer still reinforces identity and keeps your system alive.",
    },
    {
      type: "core_concept",
      text: "Automation is not only about money movement, it is about reducing mental overhead. Fewer repeated decisions means more energy for family, health, and high-priority tasks.",
    },
    {
      type: "guided_example",
      text: "Review your automation once per month: keep what works, adjust what feels too tight, and avoid frequent big changes. Stable systems create stable behavior.",
    },
  ],
  b4_l1_what_is_investing: [
    {
      type: "warm_intro",
      text: "Investing can feel intimidating in the beginning, especially when daily life already feels full. At its core, investing is simple: move money into productive assets so it can grow over long periods.",
    },
    {
      type: "core_concept",
      text: "Compounding means returns generate additional returns over time. This is why consistency and time horizon matter more than trying to perfectly predict market moves. The process is often more important than short-term performance.",
    },
    {
      type: "guided_example",
      text: "A steady monthly contribution over years often outperforms irregular large deposits. Build a simple investing routine first. You can optimize details later once the habit is stable and emotionally manageable.",
    },
    {
      type: "core_concept",
      text: "Short-term volatility is normal. If your plan is long-term and diversified, temporary downturns are part of the journey, not necessarily a signal that your plan failed.",
    },
    {
      type: "guided_example",
      text: "Set one personal rule: \"I invest monthly and review quarterly, not daily.\" Rules like this protect you from emotional reactions and support disciplined long-term behavior.",
    },
  ],
  b4_l2_risk_and_diversification: [
    {
      type: "warm_intro",
      text: "Risk is not about being fearless. It is about choosing a level you can emotionally hold through uncertainty. A \"perfect\" portfolio that you abandon during stress is worse than a simpler one you can stick with.",
    },
    {
      type: "core_concept",
      text: "Diversification spreads risk across many assets so one bad outcome has less impact on your full plan. This helps smooth outcomes and reduces the chance that one event derails long-term goals.",
    },
    {
      type: "guided_example",
      text: "Instead of betting on one company, use broad diversified funds and pair them with a risk level that fits your life stage and stress tolerance. The best plan is the one you can follow consistently.",
    },
    {
      type: "core_concept",
      text: "Your real risk profile is behavioral, not theoretical. If a portfolio keeps you calm enough to stay invested through volatility, it is usually a better fit than one with higher theoretical returns but higher emotional pressure.",
    },
    {
      type: "guided_example",
      text: "Write your personal risk sentence: \"I can handle temporary declines of about X% without changing my plan.\" This simple statement helps you choose allocation with realism instead of guesswork.",
    },
  ],
};

const BEGINNER_INTERACTIVE_TASKS: Record<string, InteractiveTask[]> = {
  b1_l1_money_without_shame: [
    {
      task_id: "stress_reset_choice",
      type: "scenario_choice",
      title: "Choose your best 10-minute money reset",
      description:
        "You are tired, the day was heavy, and money thoughts feel overwhelming. Pick the step that gives fast clarity with low effort.",
      options: [
        {
          id: "avoid",
          label: "Avoid checking money until the weekend",
          feedback: "Avoiding usually increases stress because uncertainty grows.",
        },
        {
          id: "tiny_clarity",
          label: "Open your account and note income plus two biggest expenses",
          feedback: "Great choice. Tiny clarity steps reduce anxiety and restore control quickly.",
        },
        {
          id: "full_rebuild",
          label: "Rebuild your entire yearly budget tonight",
          feedback: "Too heavy for a stress moment. Start with one small repeatable step instead.",
        },
      ],
      hint: "Pick the option you can repeat even on hard days.",
    },
  ],
  b1_l2_cashflow_map: [
    {
      task_id: "cashflow_snapshot",
      type: "quick_calc",
      title: "Build a one-minute cashflow snapshot",
      description: "Enter one realistic month. The goal is orientation, not perfection.",
      fields: [
        { key: "income", label: "Monthly income", placeholder: "2500" },
        { key: "fixed", label: "Fixed costs", placeholder: "1500" },
        { key: "flex", label: "Flexible spending", placeholder: "700" },
      ],
      hint: "If the result is negative, reduce one flexible area first.",
    },
  ],
  b2_l1_simple_budget_method: [
    {
      task_id: "bucket_split_planner",
      type: "quick_calc",
      title: "Plan your three-bucket split",
      description: "Use a realistic income and test your own percentages.",
      fields: [
        { key: "income", label: "Monthly income", placeholder: "2500" },
        { key: "essentials_pct", label: "Essentials %", placeholder: "60" },
        { key: "flex_pct", label: "Life/Flex %", placeholder: "30" },
      ],
      hint: "Future % is what stays after essentials and life/flex.",
    },
  ],
  b2_l2_unit_prices: [
    {
      task_id: "unit_price_lab",
      type: "quick_calc",
      title: "Unit price trainer (per 100g/ml)",
      description:
        "Compare two products by value, not by package price. Enter grams for food or milliliters for liquids.",
      fields: [
        { key: "a_price", label: "Product A price", placeholder: "2.40" },
        { key: "a_size", label: "Product A size (g/ml)", placeholder: "400" },
        { key: "b_price", label: "Product B price", placeholder: "3.00" },
        { key: "b_size", label: "Product B size (g/ml)", placeholder: "600" },
      ],
      hint: "Lower cost per 100 means better value.",
    },
  ],
  b3_l1_emergency_fund: [
    {
      task_id: "emergency_target_builder",
      type: "quick_calc",
      title: "Emergency target builder",
      description: "Set a practical first emergency target based on essentials.",
      fields: [
        { key: "essentials", label: "Monthly essentials", placeholder: "1400" },
        { key: "months", label: "Months to cover", placeholder: "1" },
      ],
      hint: "Start with 1 month if this feels heavy. Scale after consistency.",
    },
  ],
  b3_l2_automate_saving: [
    {
      task_id: "automation_rule_builder",
      type: "quick_calc",
      title: "Automation rule: default plus fallback",
      description:
        "Set a normal transfer and a fallback transfer for hard months so the habit never breaks.",
      fields: [
        { key: "default_amount", label: "Default monthly transfer", placeholder: "100" },
        { key: "fallback_amount", label: "Fallback monthly transfer", placeholder: "25" },
      ],
      hint: "Fallback should feel easy enough to keep every month.",
    },
  ],
  b4_l1_what_is_investing: [
    {
      task_id: "long_term_growth_check",
      type: "quick_calc",
      title: "Long-term growth check",
      description:
        "Estimate how regular monthly investing can grow over time. This is an estimate, not a guarantee.",
      fields: [
        { key: "monthly", label: "Monthly amount", placeholder: "100" },
        { key: "years", label: "Years invested", placeholder: "10" },
        { key: "return_rate", label: "Expected annual return %", placeholder: "5" },
      ],
      hint: "Time in the market usually matters more than perfect timing.",
    },
  ],
  b4_l2_risk_and_diversification: [
    {
      task_id: "diversification_choice",
      type: "scenario_choice",
      title: "Pick the more resilient plan",
      description:
        "Both options use the same monthly amount. Pick the one that protects you from one bad single-company outcome.",
      options: [
        {
          id: "single_stock",
          label: "Put everything into one popular stock",
          feedback: "Higher concentration risk. One bad event can hit the full plan.",
        },
        {
          id: "diversified_fund",
          label: "Use a diversified broad-market fund",
          feedback: "Better choice for long-term stability and lower single-company risk.",
        },
      ],
      hint: "The best plan is the one you can stick to through volatility.",
    },
  ],
};

const BEGINNER_QUIZ_OVERRIDES: Record<string, { questions: QuizQuestion[] }> = {
  b1_l1_money_without_shame: {
    questions: [
      {
        id: "b1_l1_q1",
        type: "multi_choice",
        prompt: "When money stress is high, what is the best first move?",
        options: [
          "Take one tiny clarity step you can finish in 10 minutes",
          "Delay everything until you have a full free day",
          "Try to fix your entire yearly plan at once",
          "Ignore it so you can avoid stress",
        ],
        answer_index: 0,
        explanation: "Small repeatable actions lower stress and build momentum.",
      },
      {
        id: "b1_l1_q2",
        type: "true_false",
        prompt: "You need a perfect budget before you can make progress.",
        answer: false,
        explanation: "Progress starts with consistency, not perfection.",
      },
      {
        id: "b1_l1_q3",
        type: "multi_choice",
        prompt: "Which weekly routine supports calm control?",
        options: [
          "Income, expenses, one adjustment for next week",
          "Only check money when there is an emergency",
          "Change your whole plan every day",
          "Track spending once every few months",
        ],
        answer_index: 0,
        explanation: "A short consistent routine beats irregular intense effort.",
      },
    ],
  },
  b1_l2_cashflow_map: {
    questions: [
      {
        id: "b1_l2_q1",
        type: "multi_choice",
        prompt: "A useful cashflow map starts with:",
        options: [
          "Income, then fixed costs, then flexible spending",
          "Only investment ideas",
          "A long list of random categories",
          "Removing all spending immediately",
        ],
        answer_index: 0,
        explanation: "You need incoming and outgoing flow first to make good decisions.",
      },
      {
        id: "b1_l2_q2",
        type: "multi_choice",
        prompt: "Income 2,400. Fixed 1,400. Flexible 600. What remains?",
        options: ["400", "200", "600", "1,000"],
        answer_index: 0,
        explanation: "2,400 minus 1,400 minus 600 equals 400.",
      },
      {
        id: "b1_l2_q3",
        type: "true_false",
        prompt: "Cashflow problems are often about timing, not only income size.",
        answer: true,
        explanation: "Bill timing pressure can create stress even with decent income.",
      },
    ],
  },
  b2_l1_simple_budget_method: {
    questions: [
      {
        id: "b2_l1_q1",
        type: "multi_choice",
        prompt: "What is the purpose of the three-bucket method?",
        options: [
          "Protect essentials, allow flexibility, and still fund the future",
          "Track every cent with maximum complexity",
          "Spend everything now and save later",
          "Only focus on investment returns",
        ],
        answer_index: 0,
        explanation: "Three buckets keep decisions simple and resilient.",
      },
      {
        id: "b2_l1_q2",
        type: "multi_choice",
        prompt: "If money feels tight this month, what should usually be reduced first?",
        options: [
          "One flexible spending category",
          "Essential bills like rent",
          "All savings forever",
          "Insurance protection",
        ],
        answer_index: 0,
        explanation: "Trim flex areas first and keep core protection stable.",
      },
      {
        id: "b2_l1_q3",
        type: "true_false",
        prompt: "Even a small future transfer is worth keeping.",
        answer: true,
        explanation: "Consistency matters more than transfer size at the start.",
      },
    ],
  },
  b2_l2_unit_prices: {
    questions: [
      {
        id: "b2_l2_q1",
        type: "multi_choice",
        prompt: "A costs 2.40 for 400g. B costs 3.00 for 600g. Which is cheaper per 100g?",
        options: ["A", "B", "Both equal", "Not enough information"],
        answer_index: 1,
        explanation: "A is 0.60 per 100g. B is 0.50 per 100g.",
      },
      {
        id: "b2_l2_q2",
        type: "true_false",
        prompt: "A bigger package is always better value.",
        answer: false,
        explanation: "Only unit price confirms value.",
      },
      {
        id: "b2_l2_q3",
        type: "multi_choice",
        prompt: "Which habit saves money without major lifestyle change?",
        options: [
          "Check unit price for a few high-frequency categories",
          "Only buy the cheapest visible shelf label",
          "Stop all grocery planning",
          "Buy random bulk items",
        ],
        answer_index: 0,
        explanation: "Targeted unit-price checks compound into strong yearly savings.",
      },
    ],
  },
  b3_l1_emergency_fund: {
    questions: [
      {
        id: "b3_l1_q1",
        type: "multi_choice",
        prompt: "A practical first emergency-fund milestone is usually:",
        options: [
          "A realistic starter target you can reach soon",
          "A huge target you cannot fund this year",
          "No target at all",
          "Only using credit cards for emergencies",
        ],
        answer_index: 0,
        explanation: "Starter milestones create momentum and reduce debt risk.",
      },
      {
        id: "b3_l1_q2",
        type: "true_false",
        prompt: "Emergency savings are wasted money if not used every month.",
        answer: false,
        explanation: "Their value is protection and stress reduction.",
      },
      {
        id: "b3_l1_q3",
        type: "multi_choice",
        prompt: "What supports steady emergency-fund progress?",
        options: [
          "Automatic transfer after each income payment",
          "Saving only if something is left at month-end",
          "Changing the target every week",
          "Skipping all reviews",
        ],
        answer_index: 0,
        explanation: "Automation protects progress from daily willpower swings.",
      },
    ],
  },
  b3_l2_automate_saving: {
    questions: [
      {
        id: "b3_l2_q1",
        type: "multi_choice",
        prompt: "Why use a fallback amount for saving?",
        options: [
          "To keep the habit alive during tight months",
          "To stop saving whenever life gets busy",
          "To increase spending pressure",
          "To avoid reviewing your plan",
        ],
        answer_index: 0,
        explanation: "Fallback rules prevent all-or-nothing behavior.",
      },
      {
        id: "b3_l2_q2",
        type: "true_false",
        prompt: "It is better to pause saving completely than reduce the amount.",
        answer: false,
        explanation: "A small transfer still protects consistency.",
      },
      {
        id: "b3_l2_q3",
        type: "multi_choice",
        prompt: "Which monthly process is best?",
        options: [
          "Run default transfer, use fallback only when needed",
          "Choose a random amount every month",
          "Skip all automation and decide daily",
          "Save only after impulse purchases",
        ],
        answer_index: 0,
        explanation: "Predictable rules reduce stress and improve follow-through.",
      },
    ],
  },
  b4_l1_what_is_investing: {
    questions: [
      {
        id: "b4_l1_q1",
        type: "multi_choice",
        prompt: "What does compounding mean?",
        options: [
          "Returns generating additional returns over time",
          "Only investing when markets are perfect",
          "Switching strategies every week",
          "Avoiding all short-term volatility",
        ],
        answer_index: 0,
        explanation: "Compounding is growth on prior growth.",
      },
      {
        id: "b4_l1_q2",
        type: "multi_choice",
        prompt: "Which behavior usually supports long-term investing?",
        options: [
          "Regular monthly investing with periodic review",
          "Checking price moves all day",
          "Trying to predict every market turn",
          "Pausing after every down week",
        ],
        answer_index: 0,
        explanation: "Consistent process beats emotional timing.",
      },
      {
        id: "b4_l1_q3",
        type: "true_false",
        prompt: "Short-term market drops can still happen in a healthy long-term plan.",
        answer: true,
        explanation: "Volatility is normal. Strategy and horizon matter.",
      },
    ],
  },
  b4_l2_risk_and_diversification: {
    questions: [
      {
        id: "b4_l2_q1",
        type: "multi_choice",
        prompt: "What is the main benefit of diversification?",
        options: [
          "Lower impact from one single bad outcome",
          "Guaranteed profits every month",
          "No market movement at all",
          "Faster short-term gains in every case",
        ],
        answer_index: 0,
        explanation: "Diversification spreads risk across many holdings.",
      },
      {
        id: "b4_l2_q2",
        type: "multi_choice",
        prompt: "Which plan is usually more resilient for families?",
        options: [
          "Broad diversified fund aligned with your risk comfort",
          "Putting all money into one favorite stock",
          "Switching to cash after every red day",
          "Copying random internet picks",
        ],
        answer_index: 0,
        explanation: "Resilience and consistency matter most over time.",
      },
      {
        id: "b4_l2_q3",
        type: "true_false",
        prompt: "The best risk level is the one you can hold during market stress.",
        answer: true,
        explanation: "Behavioral fit is essential for long-term success.",
      },
    ],
  },
};

function buildGuidedExample(seed: LessonSeed): string {
  if (seed.taskType === "quick_calc" || seed.taskType === "money_input") {
    return "Use your real numbers for one quick calculation and write the result. Clarity beats guessing every time.";
  }
  if (seed.taskType === "comparison_picker") {
    return "Compare two realistic options, then explain your choice in one sentence. This builds stronger decision habits.";
  }
  if (seed.taskType === "scenario_choice") {
    return "Read a realistic scenario and pick the calm, practical action. Focus on consistency and downside protection.";
  }
  if (seed.taskType === "mini_plan_builder") {
    return "Create a simple plan with clear numbers, one trigger, and one review point. If it takes under 5 minutes to maintain, it is likely sustainable.";
  }
  if (seed.taskType === "slider") {
    return "Rate your confidence today, then choose one move that increases confidence by one step this week.";
  }
  if (seed.taskType === "number_input") {
    return "Enter one realistic number and test how small changes affect your monthly or long-term result.";
  }
  return "Choose one practical action from this lesson and schedule it this week.";
}

function buildContentBlocks(seed: LessonSeed): LessonContentBlock[] {
  if (BEGINNER_CONTENT[seed.id]) {
    return BEGINNER_CONTENT[seed.id];
  }

  return [
    {
      type: "warm_intro",
      text: `This lesson helps you make ${seed.title.toLowerCase()} easier to apply in everyday life, even during busy weeks.`,
    },
    {
      type: "core_concept",
      text: seed.objective,
    },
    {
      type: "guided_example",
      text: buildGuidedExample(seed),
    },
  ];
}

function buildQuiz(seed: LessonSeed): { questions: QuizQuestion[] } {
  const lowerObjective = seed.objective.toLowerCase();
  const nextStepOption = lowerObjective.includes("automate")
    ? "Set one automatic rule and review it weekly"
    : lowerObjective.includes("risk")
      ? "Choose one written rule before volatility appears"
      : "Apply one concrete step this week";

  return {
    questions: [
      {
        id: `${seed.id}_q1`,
        type: "multi_choice",
        prompt: `Which action best reflects the lesson focus: "${seed.title}"?`,
        options: [
          `Use this lesson objective in practice: ${seed.objective}`,
          "Chase fast results without a repeatable process",
          "Delay action until everything feels perfect",
          "Ignore tracking and rely on memory",
        ],
        answer_index: 0,
        explanation: "A practical, repeatable behavior is the intended outcome of each lesson.",
      },
      {
        id: `${seed.id}_q2`,
        type: "true_false",
        prompt: "Structured small actions usually outperform occasional high-intensity effort.",
        answer: true,
        explanation: "Consistency lowers stress and creates reliable long-term progress.",
      },
      {
        id: `${seed.id}_q3`,
        type: "multi_choice",
        prompt: "What is the best immediate next step after this lesson?",
        options: [
          nextStepOption,
          "Wait for motivation before starting",
          "Change your full system overnight",
          "Skip review and rely on memory",
        ],
        answer_index: 0,
        explanation: "A single concrete next action turns learning into results.",
      },
    ],
  };
}

function buildDefaultInteractiveTask(seed: LessonSeed): InteractiveTask {
  if (seed.taskType === "quick_calc") {
    return {
      task_id: `${seed.id}_quick_calc`,
      type: "quick_calc",
      title: "Quick scenario check",
      description: "Use realistic numbers from your own life.",
      fields: [
        { key: "value_a", label: "Input A", placeholder: "100" },
        { key: "value_b", label: "Input B", placeholder: "50" },
      ],
      hint: "Enter approximate values. Accuracy can improve over time.",
    };
  }

  if (seed.taskType === "mini_plan_builder") {
    return {
      task_id: `${seed.id}_mini_plan`,
      type: "mini_plan_builder",
      title: "Build your mini plan",
      description: "Define one concrete action and one fallback action.",
      fields: [
        { key: "main_action_amount", label: "Main monthly amount", placeholder: "100" },
        { key: "fallback_amount", label: "Fallback monthly amount", placeholder: "25" },
      ],
      hint: "Fallback should feel easy enough to keep during busy months.",
    };
  }

  if (seed.taskType === "comparison_picker") {
    return {
      task_id: `${seed.id}_comparison`,
      type: "comparison_picker",
      title: "Choose the stronger option",
      description: "Pick the option that is more resilient over time.",
      options: [
        {
          id: "steady_system",
          label: "Use a simple repeatable system",
          feedback: "Great choice. Repeatability usually wins over intensity.",
        },
        {
          id: "reactive_choice",
          label: "Change strategy every week",
          feedback: "Frequent changes often reduce consistency and increase stress.",
        },
      ],
      hint: "Prefer options you can repeat even during stressful weeks.",
    };
  }

  if (seed.taskType === "scenario_choice") {
    return {
      task_id: `${seed.id}_scenario`,
      type: "scenario_choice",
      title: "Real-life decision",
      description: "Pick the response that protects consistency.",
      options: [
        {
          id: "calm_step",
          label: "Take one small, trackable step now",
          feedback: "Correct direction. Small actions create momentum.",
        },
        {
          id: "delay_step",
          label: "Wait for a perfect week to start",
          feedback: "Perfection delays progress. Start with a small practical move.",
        },
      ],
      hint: "Momentum matters more than perfect timing.",
    };
  }

  if (seed.taskType === "slider") {
    return {
      task_id: `${seed.id}_confidence_slider`,
      type: "slider",
      title: "Confidence check",
      description: "How confident do you feel applying this today?",
      options: [
        { id: "c1", label: "1 - very low" },
        { id: "c2", label: "2 - low" },
        { id: "c3", label: "3 - medium" },
        { id: "c4", label: "4 - good" },
        { id: "c5", label: "5 - very high" },
      ],
      hint: "Pick one level, then choose one action that can raise it by one step.",
    };
  }

  if (seed.taskType === "number_input") {
    return {
      task_id: `${seed.id}_number_input`,
      type: "number_input",
      title: "Run a personal estimate",
      description: "Estimate a realistic monthly amount for this concept.",
      fields: [{ key: "monthly_amount", label: "Monthly amount", placeholder: "100" }],
      hint: "Start with a realistic amount you can sustain.",
    };
  }

  return {
    task_id: `${seed.id}_practice_choice`,
    type: "multi_choice",
    title: "Pick your next action",
    options: [
      { id: "one_step", label: "Take one practical step this week" },
      { id: "wait", label: "Wait until conditions are perfect" },
    ],
  };
}

function buildLesson(seed: LessonSeed, levelId: CourseLevel["level_id"]): Lesson {
  const customTasks = BEGINNER_INTERACTIVE_TASKS[seed.id];
  const customQuiz = BEGINNER_QUIZ_OVERRIDES[seed.id];

  return {
    lesson_id: seed.id,
    title: seed.title,
    duration: seed.duration,
    objective: seed.objective,
    isPremium: levelId !== "beginner",
    content_blocks: buildContentBlocks(seed),
    interactive_tasks: customTasks ?? [buildDefaultInteractiveTask(seed)],
    quiz: customQuiz ?? buildQuiz(seed),
  };
}

function buildModule(
  moduleId: string,
  title: string,
  lessons: LessonSeed[],
  levelId: CourseLevel["level_id"]
): Module {
  return {
    module_id: moduleId,
    title,
    lessons: lessons.map((seed) => buildLesson(seed, levelId)),
  };
}

const beginnerModules: Module[] = [
  buildModule("b1_mindset_and_basics", "A calm start", [
    {
      id: "b1_l1_money_without_shame",
      title: "Money, but kinder",
      duration: "5 min",
      objective: "Reduce money anxiety and focus on one next practical step.",
      taskType: "slider",
    },
    {
      id: "b1_l2_cashflow_map",
      title: "Your cashflow in 5 minutes",
      duration: "6 min",
      objective: "Understand what comes in, what goes out, and what is left.",
      taskType: "quick_calc",
    },
  ], "beginner"),
  buildModule("b2_budgeting_for_real_life", "Budgeting that works", [
    {
      id: "b2_l1_simple_budget_method",
      title: "A simple budget you can keep",
      duration: "6 min",
      objective: "Create a flexible 3-bucket budget that survives real life.",
      taskType: "mini_plan_builder",
    },
    {
      id: "b2_l2_unit_prices",
      title: "Unit prices: your shopping superpower",
      duration: "7 min",
      objective: "Compare products by value and spend smarter with less effort.",
      taskType: "comparison_picker",
    },
  ], "beginner"),
  buildModule("b3_saving_and_emergency_fund", "Saving without stress", [
    {
      id: "b3_l1_emergency_fund",
      title: "Your safety cushion",
      duration: "6 min",
      objective: "Set a realistic emergency-fund target and first milestone.",
      taskType: "mini_plan_builder",
    },
    {
      id: "b3_l2_automate_saving",
      title: "Make saving automatic",
      duration: "5 min",
      objective: "Define an automatic saving rule with a fallback amount.",
      taskType: "mini_plan_builder",
    },
  ], "beginner"),
  buildModule("b4_investing_basics", "Investing basics", [
    {
      id: "b4_l1_what_is_investing",
      title: "What is investing?",
      duration: "6 min",
      objective: "Understand long-term investing and compounding basics.",
      taskType: "number_input",
    },
    {
      id: "b4_l2_risk_and_diversification",
      title: "Risk without fear",
      duration: "7 min",
      objective: "Understand diversification and pick your risk comfort level.",
      taskType: "multi_choice",
    },
  ], "beginner"),
];

const intermediateModules: Module[] = [
  buildModule("i1_cashflow_and_debt_systems", "Cashflow and debt systems", [
    {
      id: "i1_l1_cashflow_buffer_system",
      title: "Build a cashflow buffer",
      duration: "7 min",
      objective: "Create a small monthly buffer to reduce timing stress.",
      taskType: "mini_plan_builder",
    },
    {
      id: "i1_l2_debt_paydown_strategy",
      title: "Debt payoff with less pressure",
      duration: "8 min",
      objective: "Choose and automate a realistic debt payoff strategy.",
      taskType: "scenario_choice",
    },
  ], "intermediate"),
  buildModule("i2_investing_routine", "Your investing routine", [
    {
      id: "i2_l1_simple_portfolio_setup",
      title: "Set up a simple portfolio",
      duration: "7 min",
      objective: "Build a diversified allocation you can actually maintain.",
      taskType: "mini_plan_builder",
    },
    {
      id: "i2_l2_dca_and_rebalancing_basics",
      title: "DCA and rebalancing",
      duration: "7 min",
      objective: "Run a monthly investing process with clear rebalancing rules.",
      taskType: "mini_plan_builder",
    },
  ], "intermediate"),
  buildModule("i3_family_planning_systems", "Family planning systems", [
    {
      id: "i3_l1_sinking_funds",
      title: "Sinking funds for real life",
      duration: "6 min",
      objective: "Prepare predictable irregular costs before they hit your budget.",
      taskType: "quick_calc",
    },
    {
      id: "i3_l2_protection_check",
      title: "Protection check: insurance basics",
      duration: "7 min",
      objective: "Prioritize household protection layers for stronger resilience.",
      taskType: "comparison_picker",
    },
  ], "intermediate"),
  buildModule("i4_behavior_and_review", "Behavior and review", [
    {
      id: "i4_l1_spending_triggers",
      title: "Break spending triggers",
      duration: "6 min",
      objective: "Identify personal spending triggers and add practical friction.",
      taskType: "mini_plan_builder",
    },
    {
      id: "i4_l2_weekly_money_review",
      title: "15-minute weekly money review",
      duration: "6 min",
      objective: "Set a short weekly checklist for calm money control.",
      taskType: "mini_plan_builder",
    },
  ], "intermediate"),
];

const advancedModules: Module[] = [
  buildModule("a1_wealth_architecture", "Wealth architecture", [
    {
      id: "a1_l1_asset_allocation_playbook",
      title: "Asset allocation playbook",
      duration: "8 min",
      objective: "Map asset allocation to goal timeline and risk profile.",
      taskType: "mini_plan_builder",
    },
    {
      id: "a1_l2_tax_efficiency_basics",
      title: "Tax-aware investing basics",
      duration: "7 min",
      objective: "Improve after-tax outcomes through better account structure.",
      taskType: "comparison_picker",
    },
  ], "advanced"),
  buildModule("a2_portfolio_maintenance", "Portfolio maintenance", [
    {
      id: "a2_l1_rebalancing_decisions",
      title: "Rebalancing decision rules",
      duration: "7 min",
      objective: "Use objective rebalancing rules to manage portfolio risk.",
      taskType: "scenario_choice",
    },
    {
      id: "a2_l2_sequence_risk_basics",
      title: "Sequence risk for families",
      duration: "8 min",
      objective: "Use buffers and rules to handle drawdown periods.",
      taskType: "quick_calc",
    },
  ], "advanced"),
  buildModule("a3_family_future_planning", "Family future planning", [
    {
      id: "a3_l1_education_goal_planning",
      title: "Education goal planning",
      duration: "7 min",
      objective: "Break large family goals into realistic monthly plans.",
      taskType: "quick_calc",
    },
    {
      id: "a3_l2_multi_goal_tradeoffs",
      title: "Balancing multiple goals",
      duration: "8 min",
      objective: "Handle trade-offs with a clear priority framework.",
      taskType: "comparison_picker",
    },
  ], "advanced"),
  buildModule("a4_decision_quality", "Decision quality and resilience", [
    {
      id: "a4_l1_decision_framework",
      title: "A personal decision framework",
      duration: "7 min",
      objective: "Use explicit rules for high-impact financial decisions.",
      taskType: "mini_plan_builder",
    },
    {
      id: "a4_l2_crisis_response_plan",
      title: "Crisis response plan",
      duration: "8 min",
      objective: "Create a written playbook for market and life shocks.",
      taskType: "scenario_choice",
    },
  ], "advanced"),
];

export const momsInvestmentJourney: CourseLevel[] = [
  {
    level_id: "beginner",
    title: "Beginner: Calm Foundations",
    goal:
      "Build a low-stress baseline: understand cashflow, budget simply, save consistently, and learn investing basics.",
    modules: beginnerModules,
  },
  {
    level_id: "intermediate",
    title: "Intermediate: Build Stability + Invest Consistently",
    goal:
      "Optimize systems, handle debt strategically, and run an investing routine with confidence.",
    modules: intermediateModules,
  },
  {
    level_id: "advanced",
    title: "Advanced: Optimize + Grow Wealth",
    goal:
      "Refine allocation, improve efficiency, and make high-quality long-term financial decisions.",
    modules: advancedModules,
  },
];

export function getAllLessonsOrdered(): Lesson[] {
  return momsInvestmentJourney.flatMap((level) =>
    level.modules.flatMap((module) => module.lessons)
  );
}

export function findLessonById(lessonId: string): Lesson | undefined {
  return getAllLessonsOrdered().find((lesson) => lesson.lesson_id === lessonId);
}

export function getLessonLevelId(
  lessonId: string
): CourseLevel["level_id"] | undefined {
  for (const level of momsInvestmentJourney) {
    for (const module of level.modules) {
      if (module.lessons.some((lesson) => lesson.lesson_id === lessonId)) {
        return level.level_id;
      }
    }
  }
  return undefined;
}

export function getLessonIndex(lessonId: string): number {
  return getAllLessonsOrdered().findIndex(
    (lesson) => lesson.lesson_id === lessonId
  );
}

export function getNextLesson(currentLessonId: string): Lesson | undefined {
  const ordered = getAllLessonsOrdered();
  const currentIndex = ordered.findIndex(
    (lesson) => lesson.lesson_id === currentLessonId
  );
  if (currentIndex === -1) return undefined;
  return ordered[currentIndex + 1];
}

export function getFirstIncompleteLesson(
  completedLessons: string[]
): Lesson | undefined {
  return getAllLessonsOrdered().find(
    (lesson) => !completedLessons.includes(lesson.lesson_id)
  );
}

export function isLessonUnlocked(
  lessonId: string,
  completedLessons: string[]
): boolean {
  const ordered = getAllLessonsOrdered();
  const currentIndex = ordered.findIndex((lesson) => lesson.lesson_id === lessonId);
  if (currentIndex === -1) return false;
  if (currentIndex === 0) return true;

  const current = ordered[currentIndex];
  const previous = ordered[currentIndex - 1];
  if (!current || !previous) return false;
  if (completedLessons.includes(current.lesson_id)) return true;
  return completedLessons.includes(previous.lesson_id);
}

export function isLevelPremium(levelId: CourseLevel["level_id"]): boolean {
  return levelId !== "beginner";
}

export function isLessonPremium(lessonId: string): boolean {
  const lesson = findLessonById(lessonId);
  if (!lesson) return false;
  if (typeof lesson.isPremium === "boolean") return lesson.isPremium;
  const level = getLessonLevelId(lessonId);
  return level ? isLevelPremium(level) : false;
}

export function getLevelProgress(
  levelId: CourseLevel["level_id"],
  completedLessons: string[]
): { completed: number; total: number; percentage: number } {
  const level = momsInvestmentJourney.find((item) => item.level_id === levelId);
  const lessons = level?.modules.flatMap((module) => module.lessons) ?? [];
  const completed = lessons.filter((lesson) =>
    completedLessons.includes(lesson.lesson_id)
  ).length;
  const total = lessons.length;
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
}

export function getCourseProgress(completedLessons: string[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const allLessons = getAllLessonsOrdered();
  const completed = allLessons.filter((lesson) =>
    completedLessons.includes(lesson.lesson_id)
  ).length;
  const total = allLessons.length;
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percentage };
}
