// 16 Money-Saving Tips for Savvy App
// Categorized: Shopping, Cooking, Home, General

export interface SavingsTip {
  id: string;
  category: "shopping" | "cooking" | "home" | "general";
  title: string;
  estimatedSavings: string;
  icon: string;
  description: string;
  details: string;
}

export const savingsTips: SavingsTip[] = [
  // SHOPPING (4 Tips)
  {
    id: "shop-1",
    category: "shopping",
    title: "Shop Own-Brand Products",
    estimatedSavings: "£50/month",
    icon: "🛒",
    description: "Switch to supermarket own-brand products for everyday items",
    details: `Supermarket own-brand products are often made in the same factories as branded items but cost 30-50% less. Start with basics like pasta, rice, tinned goods, and cleaning products.

You won't notice the difference in quality, but you'll see the savings in your bank account. A family of four can easily save £50-80 per month by making this simple switch.

**How to start:**
• Compare prices on your regular items
• Start with non-food items like cleaning products
• Gradually switch food items you're comfortable with
• Keep buying branded for items where you notice a difference`,
  },
  {
    id: "shop-2",
    category: "shopping",
    title: "Use Cashback Apps",
    estimatedSavings: "£30/month",
    icon: "💳",
    description: "Earn money back on purchases you're already making",
    details: `Apps like TopCashback, Quidco, and CheckoutSmart give you money back on everyday purchases. Before buying anything online, check if there's a cashback offer.

For groceries, scan your receipts to claim cashback on specific products. It takes seconds and adds up to £30-50 per month with minimal effort.

**Best cashback apps:**
• TopCashback - best for online shopping
• Quidco - great for travel and insurance
• CheckoutSmart - supermarket receipt scanning
• Shopmium - free products and cashback

**Tips for success:**
• Always check for cashback before buying online
• Scan every grocery receipt
• Combine with sales for maximum savings`,
  },
  {
    id: "shop-3",
    category: "shopping",
    title: "Plan Weekly Shops",
    estimatedSavings: "£40/month",
    icon: "📝",
    description: "Create a shopping list and stick to it to avoid impulse buys",
    details: `Impulse purchases account for 40-60% of supermarket spending. Planning your meals for the week and writing a shopping list can dramatically reduce unnecessary spending.

**Weekly planning process:**
1. Check what you already have at home
2. Plan 5-7 dinners for the week
3. Write a list of only what you need
4. Shop after eating (never when hungry!)
5. Avoid middle aisles where temptation lurks

**Extra tips:**
• Use a shopping list app to avoid forgetting items
• Shop at quieter times when you're less rushed
• Set a budget before you go
• Leave kids at home if possible (fewer pester requests!)

This simple habit can save £40-60 per month and reduce food waste.`,
  },
  {
    id: "shop-4",
    category: "shopping",
    title: "Buy in Bulk for Staples",
    estimatedSavings: "£25/month",
    icon: "📦",
    description: "Purchase non-perishable items in larger quantities",
    details: `Items like toilet paper, pasta, rice, tinned goods, and cleaning products are cheaper when bought in bulk. Wait for special offers and stock up.

A 24-pack of toilet paper costs less per roll than a 4-pack. The same applies to most non-perishable items.

**Good items for bulk buying:**
• Toilet paper and kitchen roll
• Pasta, rice, and dried goods
• Tinned vegetables and beans
• Cleaning products
• Nappies (if applicable)

**Where to buy in bulk:**
• Costco (membership required)
• Amazon Subscribe & Save
• Supermarket multi-buy offers
• Wholesale stores

Over time, buying bulk staples saves £20-30 per month and reduces shopping trips.`,
  },

  // COOKING (4 Tips)
  {
    id: "cook-1",
    category: "cooking",
    title: "Batch Cook and Freeze",
    estimatedSavings: "£60/month",
    icon: "🍲",
    description: "Cook large portions and freeze for quick, cheap meals later",
    details: `Batch cooking is a game-changer for busy mums. Spend 2-3 hours on Sunday making large batches of bolognese, curry, chili, or soup. Portion into containers and freeze.

**Benefits:**
• Buying ingredients in bulk is cheaper
• Reduces food waste
• Avoids expensive takeaways on busy nights
• Less daily cooking stress

**Best batch cooking recipes:**
• Bolognese sauce
• Chicken curry
• Beef chili
• Vegetable soup
• Shepherd's pie

**How to start:**
1. Choose 2-3 recipes to batch cook
2. Double or triple the quantities
3. Invest in good freezer containers
4. Label everything with date and contents

Families save £50-80/month this way, plus countless hours during the week.`,
  },
  {
    id: "cook-2",
    category: "cooking",
    title: "Meal Prep with Cheaper Cuts",
    estimatedSavings: "£35/month",
    icon: "🥩",
    description: "Use budget-friendly meat cuts in slow-cooked meals",
    details: `Cheaper cuts like chicken thighs, pork shoulder, and beef shin are perfect for slow cooking. They're half the price of premium cuts but taste amazing when cooked slowly.

**Budget cuts to try:**
• Chicken thighs instead of breasts
• Pork shoulder for pulled pork
• Beef shin or chuck for stews
• Lamb neck for curries
• Whole chickens instead of portions

**Cooking methods:**
• Slow cooker (set and forget)
• Pressure cooker (faster results)
• Low oven for several hours
• One-pot stews on the hob

Swap expensive cuts for budget options and save £30-40/month without sacrificing taste. The slow cooking makes them incredibly tender and flavourful.`,
  },
  {
    id: "cook-3",
    category: "cooking",
    title: "Reduce Meat Portions",
    estimatedSavings: "£45/month",
    icon: "🥗",
    description: "Bulk out meals with vegetables and legumes",
    details: `Meat is expensive. Reducing portions by bulking out dishes with lentils, beans, chickpeas, and extra veg is healthier and cheaper.

**Easy swaps:**
• Bolognese with half the mince + red lentils
• Chili with beans and less beef
• Curry with chickpeas and vegetables
• Stew with extra root vegetables

**Meatless meal ideas:**
• Veggie stir-fry with tofu
• Bean and vegetable soup
• Mushroom risotto
• Vegetable curry
• Pasta with roasted vegetables

Try "Meatless Mondays" to start. Cutting meat by 30-50% saves £40-60/month and is healthier too. Your family probably won't even notice!`,
  },
  {
    id: "cook-4",
    category: "cooking",
    title: "Use Leftovers Creatively",
    estimatedSavings: "£30/month",
    icon: "♻️",
    description: "Transform yesterday's dinner into today's lunch",
    details: `Leftovers are free meals! Get creative and plan meals that intentionally create leftovers.

**Leftover transformations:**
• Roast chicken → sandwiches, salads, soup
• Sunday roast veg → bubble and squeak
• Curry → wraps or jacket potato filling
• Pasta sauce → pizza base or lasagne
• Rice → fried rice or rice pudding

**Tips for using leftovers:**
• Store properly and use within 2-3 days
• Label containers with contents and date
• Plan "leftover nights" into your week
• Freeze portions you won't use in time

This reduces waste and saves £25-40/month by eliminating the need for extra lunch ingredients or meal deals. Plus it's better for the planet!`,
  },

  // HOME (4 Tips)
  {
    id: "home-1",
    category: "home",
    title: "Switch Energy Supplier",
    estimatedSavings: "£200/year",
    icon: "⚡",
    description: "Compare tariffs and switch to a cheaper energy deal",
    details: `Energy prices vary wildly between suppliers. Many people stay loyal to their supplier and end up paying much more than necessary.

**How to switch:**
1. Gather your current bills
2. Use comparison sites like MoneySuperMarket or Uswitch
3. Enter your usage details
4. Compare deals and switch online
5. The new supplier handles everything

**Tips for saving:**
• Switch every year when your fixed deal ends
• Consider fixed-rate deals for budget certainty
• Check if your supplier has a cheaper tariff
• Look at dual fuel deals

Switching takes 10 minutes and can save £150-300 per year. Set a calendar reminder to check annually. Energy companies reward new customers, not loyal ones!`,
  },
  {
    id: "home-2",
    category: "home",
    title: "DIY Simple Home Repairs",
    estimatedSavings: "£100/year",
    icon: "🔧",
    description: "Learn basic repairs instead of calling tradespeople",
    details: `YouTube is your friend! Simple tasks like fixing a leaky tap, painting walls, or assembling furniture are easy to learn. Calling a tradesperson costs £50-100 per hour.

**Easy DIY tasks to learn:**
• Fixing a dripping tap (new washer)
• Unblocking drains
• Painting walls
• Putting up shelves
• Fixing loose door handles
• Bleeding radiators

**Resources:**
• YouTube tutorials
• WikiHow guides
• DIY subreddits
• Local library DIY books

**What to leave to professionals:**
• Gas work (legally required)
• Major electrical work
• Structural changes
• Roofing

Start small, build confidence, and save £100-200 per year on basic home maintenance. It's also quite satisfying!`,
  },
  {
    id: "home-3",
    category: "home",
    title: "Reduce Heating by 1°C",
    estimatedSavings: "£80/year",
    icon: "🌡️",
    description: "Lower your thermostat slightly to cut energy bills",
    details: `Turning your thermostat down by just 1°C can save £80-100 per year on heating bills. You probably won't notice the difference!

**Heating tips:**
• Set thermostat to 18-20°C (not 22-24°C)
• Wear a jumper indoors
• Use throws and blankets on the sofa
• Close curtains when it gets dark
• Turn off heating 30 mins before bed

**Smart heating habits:**
• Only heat rooms you're using
• Set heating timer to turn off before you leave
• Don't heat empty rooms
• Use a smart thermostat for better control

The house stays warm, but you stop paying for unnecessary heating. Small changes add up to big savings over the year.`,
  },
  {
    id: "home-4",
    category: "home",
    title: "Cancel Unused Subscriptions",
    estimatedSavings: "£50/month",
    icon: "📱",
    description: "Audit and cancel subscriptions you don't use",
    details: `Streaming services, gym memberships, magazines, apps—they add up fast. Most people have subscriptions they've forgotten about or rarely use.

**Common subscription culprits:**
• Multiple streaming services (Netflix + Disney+ + Prime + Apple TV...)
• Gym membership you never use
• Magazine subscriptions
• App subscriptions
• Premium versions of free apps

**How to audit:**
1. Check your bank statements for recurring payments
2. List all subscriptions and their costs
3. Cancel anything unused in the last 3 months
4. Share accounts with family where allowed
5. Rotate subscriptions (Netflix for 3 months, then Disney+)

**Questions to ask:**
• When did I last use this?
• Is there a free alternative?
• Can I share with family?

Most people save £40-70/month by cutting unused subscriptions. That's potentially £500+ per year back in your pocket!`,
  },

  // GENERAL (4 Tips)
  {
    id: "gen-1",
    category: "general",
    title: "Set Up a Savings Challenge",
    estimatedSavings: "£500/year",
    icon: "💰",
    description: "Try the 52-week savings challenge",
    details: `The 52-week challenge is a fun way to build a savings habit. Save £1 in week 1, £2 in week 2, £3 in week 3, and so on. By week 52, you'll have saved £1,378!

**Challenge variations:**
• **Standard:** Save £1-52 each week
• **Reverse:** Start with £52, decrease weekly (easier on tight months)
• **Random:** Pick any amount from 1-52 each week
• **Monthly:** Save a set amount each month

**Other saving challenges:**
• No-spend weekends
• Round-up savings (save the change)
• £5 note challenge (save every £5 you receive)
• Weather savings (save daily temperature in pence)

**Tips for success:**
• Set up automatic transfers
• Use a separate savings account
• Track progress visually
• Celebrate milestones

Small habits create big results. Pick a challenge and start today!`,
  },
  {
    id: "gen-2",
    category: "general",
    title: "Use the 30-Day Rule",
    estimatedSavings: "£100/month",
    icon: "⏰",
    description: "Wait 30 days before making non-essential purchases",
    details: `Impulse buys are budget killers. The 30-day rule is simple: before buying anything non-essential, wait 30 days.

**How it works:**
1. See something you want to buy
2. Add it to a wishlist (don't buy)
3. Wait 30 days
4. If you still want it, buy it
5. Most of the time, you'll forget about it

**Why it works:**
• Removes emotional decision-making
• Gives time to research better deals
• Often find you don't actually need it
• Prevents buyer's remorse

**Good for:**
• Clothes and fashion
• Electronics and gadgets
• Home decor
• Sale items (especially!)
• Online shopping temptations

This simple rule prevents emotional spending and saves £80-150/month on things you would have regretted buying.`,
  },
  {
    id: "gen-3",
    category: "general",
    title: "Sell Unused Items",
    estimatedSavings: "£200/year",
    icon: "🏷️",
    description: "Declutter and make money from things you don't use",
    details: `Your clutter is someone else's treasure. Selling unused items declutters your home AND puts money in your pocket.

**What sells well:**
• Baby and kids' items (outgrown clothes, toys)
• Electronics (phones, tablets, games)
• Furniture
• Clothes and shoes
• Books and DVDs

**Where to sell:**
• Facebook Marketplace (local, no fees)
• eBay (wider audience, fees apply)
• Vinted (clothes and fashion)
• Gumtree (free local listings)
• Car boot sales (multiple items)

**Tips for selling:**
• Good photos are essential
• Be honest about condition
• Price competitively
• Respond quickly to enquiries
• Consider bundling items

A decluttering session can easily generate £100-300. Plus, you'll have less stuff to clean and organize. Win-win!`,
  },
  {
    id: "gen-4",
    category: "general",
    title: "Pack Lunches Instead of Buying",
    estimatedSavings: "£80/month",
    icon: "🥪",
    description: "Bring homemade lunches to work",
    details: `Buying lunch costs £5-10 per day. Packing lunch costs £1-2. That's a saving of £80-160 per month!

**Easy packed lunch ideas:**
• Last night's leftovers
• Sandwiches and wraps
• Pasta salads
• Soup in a thermos
• Rice bowls

**Meal prep tips:**
• Prep on Sunday for the week
• Invest in good containers
• Batch cook lunch options
• Keep a backup in the freezer
• Include snacks to avoid vending machines

**What you need:**
• Good quality containers
• An insulated lunch bag
• A thermos for hot food
• Cutlery set

Your wallet (and waistline) will thank you. It's one of the easiest ways to save serious money. Start with 2-3 days a week and build from there.`,
  },
];

// Get tips by category
export function getTipsByCategory(category: string): SavingsTip[] {
  if (category === "all") return savingsTips;
  return savingsTips.filter((tip) => tip.category === category);
}

// Get a single tip by ID
export function getTipById(id: string): SavingsTip | undefined {
  return savingsTips.find((tip) => tip.id === id);
}

// Get daily tip (deterministic based on date)
export function getDailyTip(): SavingsTip {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % savingsTips.length;
  return savingsTips[index];
}
