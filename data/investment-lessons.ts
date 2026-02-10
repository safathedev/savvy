// 8 Investment Lessons for Savvy App
// 1 Free, 7 Premium

export interface InvestmentLesson {
  id: string;
  number: number;
  title: string;
  duration: string; // e.g., "5 min read"
  isPremium: boolean;
  icon: string;
  summary: string;
  content: string;
}

export const investmentLessons: InvestmentLesson[] = [
  {
    id: "lesson-1",
    number: 1,
    title: "What is Investing?",
    duration: "5 min read",
    isPremium: false,
    icon: "📈",
    summary: "Understanding the basics of investing and why it matters",
    content: `# What is Investing?

Investing is putting your money to work so it grows over time. Instead of leaving cash in a savings account earning very little interest, you buy assets that have the potential to increase in value.

## Why Invest?

**Beat Inflation**
Cash loses value over time due to inflation. If inflation is 3% and your savings account pays 1%, you're actually losing 2% of your purchasing power each year. Investing helps your money grow faster than inflation.

**Build Wealth**
Small amounts invested regularly can grow into significant sums over decades. This is the power of compound growth—your returns earn returns!

**Financial Goals**
Whether it's a house deposit, your child's university fund, or retirement, investing helps you reach big financial goals faster than saving alone.

## The Magic of Compound Interest

Imagine you invest £100 and it grows by 7% per year:
- Year 1: £107
- Year 5: £140
- Year 10: £197
- Year 20: £387
- Year 30: £761

Your £100 became £761 without adding any extra money! This is compound interest—your gains earning more gains.

## Key Concepts

**Assets** - Things you can invest in (stocks, bonds, property)

**Returns** - The profit (or loss) from your investment

**Risk** - The chance your investment could lose value

**Diversification** - Spreading investments to reduce risk

## What Can You Invest In?

- **Stocks** - Small pieces of company ownership
- **Bonds** - Loans to governments or companies
- **Index Funds** - Baskets of many stocks
- **Property** - Real estate (directly or through funds)
- **Pensions** - Tax-advantaged retirement investing

## Getting Started

You don't need thousands to start. Many platforms let you begin with just £1. The most important thing is to start—even small amounts add up over time.

> "The best time to start investing was 20 years ago. The second best time is now."

Next lesson, we'll explore the difference between stocks and bonds, and when to use each.`,
  },
  {
    id: "lesson-2",
    number: 2,
    title: "Stocks vs Bonds",
    duration: "6 min read",
    isPremium: true,
    icon: "⚖️",
    summary: "Understanding the two main asset classes",
    content: `# Stocks vs Bonds

The two most common investment types are stocks (shares) and bonds. Understanding the difference helps you build a balanced portfolio.

## What Are Stocks?

When you buy a stock, you become a part-owner of a company. If the company does well, your shares increase in value. Some companies also pay dividends—regular cash payments to shareholders.

**Pros of stocks:**
- Higher potential returns (historically 7-10% per year)
- You own part of real businesses
- Dividends provide passive income
- Easy to buy and sell

**Cons of stocks:**
- Prices can be volatile (go up and down)
- Risk of losing money if companies fail
- Requires patience for long-term gains
- Can be emotional to watch

## What Are Bonds?

A bond is a loan you make to a government or company. They pay you regular interest, and at the end of the term, you get your money back. Think of it as lending money and earning interest.

**Pros of bonds:**
- More stable than stocks
- Regular, predictable income
- Lower risk of losing everything
- Good for shorter time horizons

**Cons of bonds:**
- Lower returns than stocks (historically 2-5%)
- Inflation can erode value
- Interest rate changes affect prices
- Less exciting than stocks!

## The Risk-Return Tradeoff

Higher potential returns = higher risk

- Stocks: Higher risk, higher potential returns
- Bonds: Lower risk, lower returns
- Cash: Lowest risk, lowest returns

## Age-Based Guidelines

A common rule: subtract your age from 100 to get your stock percentage.

- Age 25: 75% stocks, 25% bonds
- Age 40: 60% stocks, 40% bonds
- Age 60: 40% stocks, 60% bonds

As you get older and closer to needing your money, you shift toward safer bonds.

## Key Takeaways

- Stocks = ownership, higher risk/reward
- Bonds = loans, lower risk/reward
- Young investors can take more risk
- Older investors need more stability
- Most people need both!

Next lesson: Index funds—the easiest way to invest in hundreds of stocks at once.`,
  },
  {
    id: "lesson-3",
    number: 3,
    title: "Index Funds Explained",
    duration: "7 min read",
    isPremium: true,
    icon: "📊",
    summary: "Why index funds are perfect for beginners",
    content: `# Index Funds Explained

Index funds are one of the best inventions for everyday investors. They're simple, cheap, and effective.

## What Is an Index Fund?

An index fund is a collection of stocks (or bonds) that tracks a market index. Instead of picking individual companies, you invest in a whole market at once.

**Popular indexes:**
- **FTSE 100** - 100 largest UK companies
- **S&P 500** - 500 largest US companies
- **FTSE All-World** - Companies from around the globe

When you buy a FTSE 100 index fund, you own a tiny piece of all 100 companies!

## Why Index Funds?

**Instant Diversification**
With one purchase, you own hundreds of companies. If one fails, others succeed.

**Low Costs**
Index funds charge 0.03-0.25% per year. Active funds charge 1-2%. That difference compounds hugely over time.

**No Stock Picking**
You don't need to research individual companies. The index does the work.

**Beat Most Professionals**
Over 15+ years, 90% of professional fund managers fail to beat simple index funds. If the pros can't beat them, why try?

## How They Work

Let's say the FTSE 100 goes up 8% this year. Your FTSE 100 index fund will also go up about 8% (minus tiny fees).

You get the market's return without trying to beat it. And that's usually enough!

## Types of Index Funds

**Equity index funds** - Track stock markets
**Bond index funds** - Track bond markets
**Global index funds** - Track worldwide stocks
**Sector index funds** - Track specific industries

For most beginners, a global index fund is perfect. You get the whole world's economy in one simple fund.

## Popular UK Index Funds

- Vanguard FTSE Global All Cap
- iShares Core MSCI World
- Vanguard LifeStrategy funds
- HSBC FTSE All-World Index

## Getting Started

Most investment platforms offer index funds. You can start with as little as £25/month through regular investing.

> "Don't look for the needle in the haystack. Just buy the haystack." — John Bogle, creator of the first index fund

Next lesson: How to start investing with just £100.`,
  },
  {
    id: "lesson-4",
    number: 4,
    title: "Starting with £100",
    duration: "5 min read",
    isPremium: true,
    icon: "💷",
    summary: "A step-by-step guide to making your first investment",
    content: `# Starting with £100

You don't need thousands to start investing. Here's how to invest your first £100.

## Step 1: Choose a Platform

You need an investment platform (broker) to buy funds. Popular options include:

**Best for beginners:**
- **Vanguard** - Simple, low fees, great funds
- **Freetrade** - Free to buy many investments
- **Hargreaves Lansdown** - More options, slightly higher fees

Look for low platform fees and access to index funds.

## Step 2: Open an ISA

A Stocks & Shares ISA is a tax-free wrapper for your investments. You pay no tax on gains or dividends—ever!

**ISA allowance:** £20,000 per year (2024/25)

Even if you only invest £100, put it in an ISA. Future you will thank present you.

## Step 3: Pick a Fund

For your first £100, keep it simple:

**Best starter fund:** A global index fund like Vanguard FTSE Global All Cap or Vanguard LifeStrategy 80%.

This gives you exposure to thousands of companies worldwide.

## Step 4: Buy the Fund

1. Log into your platform
2. Search for your chosen fund
3. Enter the amount (£100)
4. Review and confirm
5. Done!

It takes about 5 minutes once your account is set up.

## Step 5: Set Up Regular Investing

The secret to success is consistency. Set up a monthly standing order:
- Even £25/month makes a difference
- Automate it so you don't think about it
- Increase when you can afford to

## What to Expect

Your £100 will go up and down. That's normal! Over 10+ years, the trend should be upward.

**Don't:**
- Panic when markets drop
- Check your account daily
- Try to time the market

**Do:**
- Keep investing regularly
- Ignore short-term noise
- Think in decades, not days

## Real Numbers

If you invest £100/month at 7% average return:
- After 5 years: £7,000
- After 10 years: £17,300
- After 20 years: £52,000
- After 30 years: £122,000

Your total invested: £36,000
Your gains: £86,000

Time is your superpower!

Next lesson: Understanding and managing investment risk.`,
  },
  {
    id: "lesson-5",
    number: 5,
    title: "Risk Management",
    duration: "6 min read",
    isPremium: true,
    icon: "🛡️",
    summary: "How to protect yourself while investing",
    content: `# Risk Management

All investing involves risk. Understanding and managing it is key to success.

## Rule 1: Never Invest Your Emergency Fund

Before investing anything, have 3-6 months of expenses in a cash savings account. This is for:
- Job loss
- Unexpected repairs
- Medical costs
- Life emergencies

Your emergency fund keeps you from selling investments at the worst time.

## Types of Investment Risk

**Market Risk**
Markets go up and down. A 20-30% drop can happen in any year. This is normal!

**Inflation Risk**
If your returns don't beat inflation, you're losing purchasing power.

**Individual Stock Risk**
Single companies can go bankrupt. Nokia was once the world's biggest phone company!

**Timing Risk**
Buying at the top or selling at the bottom can hurt returns.

## Managing Risk

**Diversify**
Don't put all eggs in one basket. Index funds do this automatically.

**Invest for the Long Term**
Over 20+ years, stock markets have always recovered from crashes. Time smooths out risk.

**Don't Use Money You'll Need Soon**
Only invest money you won't need for 5+ years. Short-term money should stay in cash.

**Ignore the News**
Media thrives on scary headlines. Tune out daily market noise.

## Your Risk Tolerance

Be honest with yourself:
- Can you sleep while markets drop 30%?
- Will you panic sell at the bottom?
- Do you have a long time horizon?

If you're nervous, add more bonds to your portfolio. Peace of mind matters.

## The Biggest Risk of All

Not investing is a risk too! Inflation erodes cash every year. Playing it "safe" with only savings guarantees you lose purchasing power.

A balanced approach—some risk for growth, some stability for comfort—is usually best.

Next lesson: The power of diversification.`,
  },
  {
    id: "lesson-6",
    number: 6,
    title: "Diversification",
    duration: "5 min read",
    isPremium: true,
    icon: "🌍",
    summary: "Why spreading your investments is crucial",
    content: `# Diversification

"Don't put all your eggs in one basket" is the most important rule in investing.

## What Is Diversification?

Spreading your money across different investments so no single failure ruins you.

If you own 1 stock and it crashes, you lose everything.
If you own 1,000 stocks and one crashes, you barely notice.

## Ways to Diversify

**Across Companies**
Own many companies, not just one or two.

**Across Industries**
Tech, healthcare, finance, retail—different sectors do well at different times.

**Across Countries**
The UK is only 4% of global markets. Don't put everything in British companies.

**Across Asset Types**
Stocks, bonds, property—they don't all move together.

**Across Time**
Investing monthly spreads your entry points, reducing timing risk.

## The Easy Way: Index Funds

A global index fund gives you instant diversification:
- Thousands of companies
- Dozens of countries
- Multiple industries

One fund, total diversification. It's that simple.

## Real Example

In 2000, tech stocks crashed 80%. If you only owned tech, you lost almost everything.

But if you owned a diversified portfolio:
- Tech: -80%
- Healthcare: +10%
- Consumer goods: +5%
- Bonds: +8%

Your overall portfolio might have only dropped 20%. Painful, but survivable.

## Common Mistakes

**Home bias**
UK investors often put 80%+ in UK stocks. The UK is only 4% of global markets!

**Concentration**
"I love Apple so I put everything in Apple." Dangerous! Great companies can still struggle.

**False diversification**
Owning 10 tech stocks isn't diversified. You need different sectors and asset types.

## Key Takeaway

Diversification is the only free lunch in investing. It reduces risk without reducing expected returns.

A simple global index fund does the work for you.

Next lesson: Why long-term thinking beats everything else.`,
  },
  {
    id: "lesson-7",
    number: 7,
    title: "Long-Term Thinking",
    duration: "6 min read",
    isPremium: true,
    icon: "⏳",
    summary: "Why patience is an investor's greatest asset",
    content: `# Long-Term Thinking

Time is your biggest advantage as an investor. Here's why patience pays.

## Time in the Market Beats Timing the Market

Studies show that missing just the 10 best days in the market over 20 years can halve your returns. Those best days often come right after the worst days.

The solution? Stay invested. Don't try to predict the market.

## The Cost of Waiting

Let's compare two investors who both invest £200/month at 7% returns:

**Sarah starts at 25, stops at 35 (10 years)**
Total invested: £24,000
Value at 65: £227,000

**Tom starts at 35, invests until 65 (30 years)**
Total invested: £72,000
Value at 65: £243,000

Sarah invested 3x less but ended up with almost the same! That's the power of starting early.

## Market Crashes Are Normal

Markets drop 10%+ almost every year. They drop 20%+ every few years. They drop 30%+ roughly once a decade.

**But here's the thing:**
They always recover. Always. The market has returned about 7-10% annually over long periods despite wars, pandemics, financial crises, and every kind of disaster.

## What to Do During a Crash

1. **Don't sell.** Selling locks in losses.
2. **Keep investing.** You're buying at lower prices!
3. **Don't watch the news.** It's designed to scare you.
4. **Remember your goals.** Are you retiring this year? No? Then relax.

## The Long-Term Track Record

**S&P 500 returns over 20-year periods:**
The worst 20-year return ever was +6% per year. Not a single 20-year period lost money!

**Time horizon and probability of positive returns:**
- 1 year: ~70% chance of gain
- 5 years: ~85% chance of gain
- 10 years: ~95% chance of gain
- 20 years: ~100% chance of gain

Time transforms gambling into investing.

## Key Takeaways

- Start as early as possible
- Stay invested through ups and downs
- Think in decades, not days
- Crashes are buying opportunities
- Patience is your superpower

Next lesson: Common investing mistakes and how to avoid them.`,
  },
  {
    id: "lesson-8",
    number: 8,
    title: "Common Mistakes",
    duration: "7 min read",
    isPremium: true,
    icon: "⚠️",
    summary: "Avoid these costly errors most investors make",
    content: `# Common Investing Mistakes

Learn from others' mistakes. Here are the most costly errors and how to avoid them.

## Mistake 1: Trying to Time the Market

"I'll wait for the crash, then invest."

Problem: You'll miss gains while waiting, and you won't recognise the bottom anyway. Nobody can consistently time the market—not even professionals.

**Solution:** Invest regularly regardless of market conditions. Time in the market beats timing the market.

## Mistake 2: Panic Selling

Markets crash. You panic. You sell everything at the bottom.

This is the single most destructive thing you can do. You lock in losses and miss the recovery.

**Solution:** Have a plan before crashes happen. Know you won't sell. Maybe don't even look at your portfolio during scary times.

## Mistake 3: Chasing Hot Stocks

"This stock went up 200% last year! I should buy it!"

Past performance doesn't predict future returns. By the time you hear about a hot stock, the gains are likely over.

**Solution:** Stick to boring index funds. Boring is beautiful when it comes to investing.

## Mistake 4: Paying High Fees

A 2% annual fee vs 0.2% doesn't sound like much. Over 30 years, it could cost you 40% of your final portfolio!

**Example:**
- £10,000 invested at 7% return for 30 years
- With 0.2% fees: £74,000
- With 2% fees: £43,000

That's £31,000 lost to fees!

**Solution:** Use low-cost index funds. Check the ongoing charge figure (OCF).

## Mistake 5: Not Starting

"I'll start investing when I earn more / pay off debt / understand more."

The best time was yesterday. The second best time is today. Every day you wait costs you compound growth.

**Solution:** Start with whatever you have. £25/month is fine. You'll learn as you go.

## Mistake 6: Checking Too Often

Watching your portfolio daily increases stress and temptation to tinker. Short-term movements are noise.

**Solution:** Check monthly at most. Quarterly is even better. Yearly is ideal!

## Mistake 7: Not Diversifying

"I believe in Tesla" or "I'm only investing in UK stocks."

Single stocks can go to zero. Single countries can underperform for decades.

**Solution:** Use global index funds. Instant diversification.

## Mistake 8: Investing Money You Need Soon

Investing your house deposit that you need in 2 years? What if markets drop 30%?

**Solution:** Keep short-term money (needed within 5 years) in cash savings.

## Summary

**Do:**
- Start early
- Invest regularly
- Stay invested
- Keep costs low
- Diversify globally
- Think long-term

**Don't:**
- Time the market
- Panic sell
- Chase hot stocks
- Pay high fees
- Delay starting
- Check obsessively
- Concentrate risk

Congratulations! You've completed all 8 lessons. You now know more about investing than most people. The next step is simple: open an account and start with whatever you can afford.

Your future self will thank you. 🌱`,
  },
];

// Get a single lesson by ID
export function getLessonById(id: string): InvestmentLesson | undefined {
  return investmentLessons.find((lesson) => lesson.id === id);
}

// Get next lesson
export function getNextLesson(currentId: string): InvestmentLesson | undefined {
  const current = getLessonById(currentId);
  if (!current) return undefined;
  return investmentLessons.find((l) => l.number === current.number + 1);
}

// Get lesson progress
export function getLessonProgress(completedIds: string[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = investmentLessons.length;
  const completed = completedIds.length;
  const percentage = Math.round((completed / total) * 100);
  return { completed, total, percentage };
}
