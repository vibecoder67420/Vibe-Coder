// S&P 500 Sectors mapping
export const SECTORS = [
  { name: 'Technology', etf: 'XLK', icon: 'Monitor' },
  { name: 'Financials', etf: 'XLF', icon: 'DollarSign' },
  { name: 'Healthcare', etf: 'XLV', icon: 'Heart' },
  { name: 'Consumer Discretionary', etf: 'XLY', icon: 'ShoppingCart' },
  { name: 'Consumer Staples', etf: 'XLP', icon: 'Package' },
  { name: 'Industrials', etf: 'XLI', icon: 'Factory' },
  { name: 'Energy', etf: 'XLE', icon: 'Zap' },
  { name: 'Utilities', etf: 'XLU', icon: 'Lightbulb' },
  { name: 'Real Estate', etf: 'XLRE', icon: 'Building' },
  { name: 'Materials', etf: 'XLB', icon: 'Hammer' },
  { name: 'Communication Services', etf: 'XLC', icon: 'Wifi' },
];

export const SECTOR_HOLDINGS = {
  XLK: ['AAPL', 'MSFT', 'NVDA', 'AVGO', 'CRM', 'ADBE', 'CSCO', 'ACN', 'ORCL', 'INTC'],
  XLF: ['JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'BX', 'AXP', 'COF'],
  XLV: ['UNH', 'JNJ', 'LLY', 'ABBV', 'MRK', 'PFE', 'TMO', 'ABT', 'DHR', 'BMY'],
  XLY: ['AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'SBUX', 'LOW', 'TGT', 'BKNG', 'TJX'],
  XLP: ['WMT', 'PG', 'COST', 'KO', 'PEP', 'PM', 'MDLZ', 'CL', 'MO', 'GIS'],
  XLI: ['CAT', 'RTX', 'UNP', 'HON', 'DE', 'BA', 'GE', 'LMT', 'MMM', 'UPS'],
  XLE: ['XOM', 'CVX', 'COP', 'EOG', 'SLB', 'MPC', 'PSX', 'VLO', 'OXY', 'DVN'],
  XLU: ['NEE', 'SO', 'DUK', 'AEP', 'D', 'SRE', 'EXC', 'XEL', 'ED', 'WEC'],
  XLRE: ['PLD', 'AMT', 'CCI', 'EQIX', 'PSA', 'SPG', 'O', 'DLR', 'WELL', 'AVB'],
  XLB: ['LIN', 'APD', 'SHW', 'ECL', 'FCX', 'NEM', 'NUE', 'VMC', 'MLM', 'DOW'],
  XLC: ['META', 'GOOGL', 'GOOG', 'NFLX', 'DIS', 'CMCSA', 'T', 'VZ', 'TMUS', 'EA'],
};

export const US_INDICES = [
  { name: 'S&P 500', symbol: 'SPY' },
  { name: 'Nasdaq 100', symbol: 'QQQ' },
  { name: 'Dow Jones', symbol: 'DIA' },
  { name: 'Russell 2000', symbol: 'IWM' },
  { name: 'Russell Microcap', symbol: 'IWC' },
  { name: 'S&P 400 Mid Cap', symbol: 'MDY' },
  { name: 'S&P 600 Small Cap', symbol: 'SLY' },
  { name: 'Total Market', symbol: 'VTI' },
];

export const INTL_INDICES = [
  { name: 'MSCI World', symbol: 'URTH' },
  { name: 'MSCI Emerging Markets', symbol: 'EEM' },
  { name: 'FTSE 100 (UK)', symbol: 'EWU' },
  { name: 'DAX (Germany)', symbol: 'EWG' },
  { name: 'Nikkei 225 (Japan)', symbol: 'EWJ' },
  { name: 'Shanghai/China', symbol: 'MCHI' },
  { name: 'Hang Seng (HK)', symbol: 'EWH' },
  { name: 'CAC 40 (France)', symbol: 'EWQ' },
  { name: 'TSX (Canada)', symbol: 'EWC' },
  { name: 'ASX (Australia)', symbol: 'EWA' },
  { name: 'Brazil', symbol: 'EWZ' },
  { name: 'India', symbol: 'INDA' },
];

export const VOLATILITY = [
  { name: 'VIX', symbol: '^VIX' },
  { name: 'VVIX (Vol of Vol)', symbol: '^VVIX' },
];

export const ENERGY_EQUITIES = {
  'Oil & Gas Majors': ['XOM', 'CVX', 'SHEL', 'BP', 'TTE'],
  'US E&P': ['COP', 'EOG', 'DVN', 'PXD', 'FANG'],
  'Oil Services': ['SLB', 'HAL', 'BKR'],
  'Midstream/Pipeline': ['ET', 'EPD', 'KMI', 'WMB'],
  'Coal': ['BTU', 'ARCH', 'AMR'],
  'Nuclear': ['CCJ', 'LEU'],
  'Clean Energy': ['ICLN', 'TAN', 'ENPH', 'FSLR'],
  'Wind': ['NEE', 'BEP'],
  'Natural Gas & Oil ETFs': ['UNG', 'USO', 'XOP', 'URA'],
};

export const ENERGY_COMMODITIES = [
  { name: 'WTI Crude Oil', symbol: 'CL=F' },
  { name: 'Brent Crude', symbol: 'BZ=F' },
  { name: 'Natural Gas', symbol: 'NG=F' },
  { name: 'Gasoline (RBOB)', symbol: 'RB=F' },
  { name: 'Heating Oil', symbol: 'HO=F' },
  { name: 'Uranium (URA ETF)', symbol: 'URA' },
];

export const COMMODITIES = {
  'Precious Metals': [
    { name: 'Gold', symbol: 'GLD' },
    { name: 'Silver', symbol: 'SLV' },
    { name: 'Platinum', symbol: 'PPLT' },
    { name: 'Palladium', symbol: 'PALL' },
  ],
  'Industrial Metals': [
    { name: 'Copper', symbol: 'CPER' },
    { name: 'Steel', symbol: 'SLX' },
    { name: 'Lithium', symbol: 'LIT' },
  ],
  'Agriculture': [
    { name: 'Wheat', symbol: 'WEAT' },
    { name: 'Corn', symbol: 'CORN' },
    { name: 'Soybeans', symbol: 'SOYB' },
    { name: 'Coffee', symbol: 'JO' },
    { name: 'Sugar', symbol: 'CANE' },
    { name: 'Lumber', symbol: 'WOOD' },
  ],
};

export const FX_PAIRS = [
  { name: 'US Dollar Index', symbol: 'DX-Y.NYB' },
  { name: 'EUR/USD', symbol: 'EURUSD=X' },
  { name: 'USD/JPY', symbol: 'JPY=X' },
  { name: 'GBP/USD', symbol: 'GBPUSD=X' },
  { name: 'USD/CNY', symbol: 'CNY=X' },
  { name: 'USD/CAD', symbol: 'CAD=X' },
  { name: 'AUD/USD', symbol: 'AUDUSD=X' },
  { name: 'USD/CHF', symbol: 'CHF=X' },
  { name: 'USD/MXN', symbol: 'MXN=X' },
  { name: 'USD/BRL', symbol: 'BRL=X' },
];

export const BONDS = [
  { name: '2-Year Treasury', symbol: '^IRX' },
  { name: '10-Year Treasury', symbol: '^TNX' },
  { name: '30-Year Treasury', symbol: '^TYX' },
  { name: 'Investment Grade Bonds', symbol: 'LQD' },
  { name: 'High Yield (Junk) Bonds', symbol: 'HYG' },
  { name: 'Treasury Bond ETF', symbol: 'TLT' },
  { name: 'TIPS (Inflation-Protected)', symbol: 'TIP' },
];

export const CRYPTO = [
  'BTC-USD', 'ETH-USD', 'BNB-USD', 'SOL-USD', 'XRP-USD',
  'USDC-USD', 'ADA-USD', 'AVAX-USD', 'DOGE-USD', 'TRX-USD',
  'DOT-USD', 'LINK-USD', 'MATIC-USD', 'LTC-USD', 'BCH-USD',
  'UNI-USD', 'XLM-USD', 'ATOM-USD', 'ETC-USD', 'FIL-USD',
];

export const STABLECOINS = ['USDC-USD', 'USDT-USD'];

// SP500 companies for heatmap - top ~100 by market cap with sectors
export const SP500_COMPANIES = [
  // Technology
  { symbol: 'AAPL', name: 'Apple', sector: 'Technology', marketCap: 3000 },
  { symbol: 'MSFT', name: 'Microsoft', sector: 'Technology', marketCap: 2800 },
  { symbol: 'NVDA', name: 'NVIDIA', sector: 'Technology', marketCap: 2500 },
  { symbol: 'AVGO', name: 'Broadcom', sector: 'Technology', marketCap: 800 },
  { symbol: 'CRM', name: 'Salesforce', sector: 'Technology', marketCap: 250 },
  { symbol: 'ADBE', name: 'Adobe', sector: 'Technology', marketCap: 230 },
  { symbol: 'CSCO', name: 'Cisco', sector: 'Technology', marketCap: 220 },
  { symbol: 'ACN', name: 'Accenture', sector: 'Technology', marketCap: 210 },
  { symbol: 'ORCL', name: 'Oracle', sector: 'Technology', marketCap: 300 },
  { symbol: 'INTC', name: 'Intel', sector: 'Technology', marketCap: 120 },
  { symbol: 'AMD', name: 'AMD', sector: 'Technology', marketCap: 200 },
  { symbol: 'QCOM', name: 'Qualcomm', sector: 'Technology', marketCap: 170 },
  { symbol: 'TXN', name: 'Texas Instruments', sector: 'Technology', marketCap: 160 },
  { symbol: 'INTU', name: 'Intuit', sector: 'Technology', marketCap: 170 },
  { symbol: 'AMAT', name: 'Applied Materials', sector: 'Technology', marketCap: 140 },
  // Communication Services
  { symbol: 'META', name: 'Meta Platforms', sector: 'Communication Services', marketCap: 1200 },
  { symbol: 'GOOGL', name: 'Alphabet', sector: 'Communication Services', marketCap: 2000 },
  { symbol: 'NFLX', name: 'Netflix', sector: 'Communication Services', marketCap: 300 },
  { symbol: 'DIS', name: 'Disney', sector: 'Communication Services', marketCap: 200 },
  { symbol: 'CMCSA', name: 'Comcast', sector: 'Communication Services', marketCap: 160 },
  { symbol: 'T', name: 'AT&T', sector: 'Communication Services', marketCap: 130 },
  { symbol: 'VZ', name: 'Verizon', sector: 'Communication Services', marketCap: 160 },
  { symbol: 'TMUS', name: 'T-Mobile', sector: 'Communication Services', marketCap: 200 },
  // Consumer Discretionary
  { symbol: 'AMZN', name: 'Amazon', sector: 'Consumer Discretionary', marketCap: 1900 },
  { symbol: 'TSLA', name: 'Tesla', sector: 'Consumer Discretionary', marketCap: 800 },
  { symbol: 'HD', name: 'Home Depot', sector: 'Consumer Discretionary', marketCap: 350 },
  { symbol: 'MCD', name: "McDonald's", sector: 'Consumer Discretionary', marketCap: 200 },
  { symbol: 'NKE', name: 'Nike', sector: 'Consumer Discretionary', marketCap: 140 },
  { symbol: 'SBUX', name: 'Starbucks', sector: 'Consumer Discretionary', marketCap: 110 },
  { symbol: 'LOW', name: "Lowe's", sector: 'Consumer Discretionary', marketCap: 140 },
  { symbol: 'TGT', name: 'Target', sector: 'Consumer Discretionary', marketCap: 70 },
  { symbol: 'BKNG', name: 'Booking Holdings', sector: 'Consumer Discretionary', marketCap: 140 },
  // Consumer Staples
  { symbol: 'WMT', name: 'Walmart', sector: 'Consumer Staples', marketCap: 500 },
  { symbol: 'PG', name: 'Procter & Gamble', sector: 'Consumer Staples', marketCap: 370 },
  { symbol: 'COST', name: 'Costco', sector: 'Consumer Staples', marketCap: 350 },
  { symbol: 'KO', name: 'Coca-Cola', sector: 'Consumer Staples', marketCap: 260 },
  { symbol: 'PEP', name: 'PepsiCo', sector: 'Consumer Staples', marketCap: 230 },
  { symbol: 'PM', name: 'Philip Morris', sector: 'Consumer Staples', marketCap: 170 },
  { symbol: 'MDLZ', name: 'Mondelez', sector: 'Consumer Staples', marketCap: 90 },
  { symbol: 'CL', name: 'Colgate-Palmolive', sector: 'Consumer Staples', marketCap: 75 },
  // Financials
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financials', marketCap: 550 },
  { symbol: 'V', name: 'Visa', sector: 'Financials', marketCap: 520 },
  { symbol: 'MA', name: 'Mastercard', sector: 'Financials', marketCap: 400 },
  { symbol: 'BAC', name: 'Bank of America', sector: 'Financials', marketCap: 280 },
  { symbol: 'WFC', name: 'Wells Fargo', sector: 'Financials', marketCap: 190 },
  { symbol: 'GS', name: 'Goldman Sachs', sector: 'Financials', marketCap: 140 },
  { symbol: 'MS', name: 'Morgan Stanley', sector: 'Financials', marketCap: 150 },
  { symbol: 'BLK', name: 'BlackRock', sector: 'Financials', marketCap: 130 },
  { symbol: 'C', name: 'Citigroup', sector: 'Financials', marketCap: 100 },
  { symbol: 'AXP', name: 'American Express', sector: 'Financials', marketCap: 160 },
  { symbol: 'BX', name: 'Blackstone', sector: 'Financials', marketCap: 160 },
  { symbol: 'KKR', name: 'KKR', sector: 'Financials', marketCap: 100 },
  // Healthcare
  { symbol: 'UNH', name: 'UnitedHealth', sector: 'Healthcare', marketCap: 500 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', marketCap: 400 },
  { symbol: 'LLY', name: 'Eli Lilly', sector: 'Healthcare', marketCap: 700 },
  { symbol: 'ABBV', name: 'AbbVie', sector: 'Healthcare', marketCap: 300 },
  { symbol: 'MRK', name: 'Merck', sector: 'Healthcare', marketCap: 280 },
  { symbol: 'PFE', name: 'Pfizer', sector: 'Healthcare', marketCap: 160 },
  { symbol: 'TMO', name: 'Thermo Fisher', sector: 'Healthcare', marketCap: 200 },
  { symbol: 'ABT', name: 'Abbott Labs', sector: 'Healthcare', marketCap: 190 },
  // Industrials
  { symbol: 'CAT', name: 'Caterpillar', sector: 'Industrials', marketCap: 170 },
  { symbol: 'RTX', name: 'RTX Corp', sector: 'Industrials', marketCap: 150 },
  { symbol: 'UNP', name: 'Union Pacific', sector: 'Industrials', marketCap: 150 },
  { symbol: 'HON', name: 'Honeywell', sector: 'Industrials', marketCap: 140 },
  { symbol: 'DE', name: 'Deere', sector: 'Industrials', marketCap: 120 },
  { symbol: 'BA', name: 'Boeing', sector: 'Industrials', marketCap: 130 },
  { symbol: 'GE', name: 'GE Aerospace', sector: 'Industrials', marketCap: 190 },
  { symbol: 'LMT', name: 'Lockheed Martin', sector: 'Industrials', marketCap: 120 },
  // Energy
  { symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy', marketCap: 450 },
  { symbol: 'CVX', name: 'Chevron', sector: 'Energy', marketCap: 290 },
  { symbol: 'COP', name: 'ConocoPhillips', sector: 'Energy', marketCap: 130 },
  { symbol: 'EOG', name: 'EOG Resources', sector: 'Energy', marketCap: 70 },
  { symbol: 'SLB', name: 'Schlumberger', sector: 'Energy', marketCap: 65 },
  { symbol: 'DVN', name: 'Devon Energy', sector: 'Energy', marketCap: 30 },
  // Utilities
  { symbol: 'NEE', name: 'NextEra Energy', sector: 'Utilities', marketCap: 150 },
  { symbol: 'SO', name: 'Southern Co', sector: 'Utilities', marketCap: 90 },
  { symbol: 'DUK', name: 'Duke Energy', sector: 'Utilities', marketCap: 85 },
  { symbol: 'AEP', name: 'AEP', sector: 'Utilities', marketCap: 50 },
  // Real Estate
  { symbol: 'PLD', name: 'Prologis', sector: 'Real Estate', marketCap: 110 },
  { symbol: 'AMT', name: 'American Tower', sector: 'Real Estate', marketCap: 95 },
  { symbol: 'CCI', name: 'Crown Castle', sector: 'Real Estate', marketCap: 45 },
  { symbol: 'EQIX', name: 'Equinix', sector: 'Real Estate', marketCap: 75 },
  { symbol: 'PSA', name: 'Public Storage', sector: 'Real Estate', marketCap: 55 },
  // Materials
  { symbol: 'LIN', name: 'Linde', sector: 'Materials', marketCap: 200 },
  { symbol: 'APD', name: 'Air Products', sector: 'Materials', marketCap: 65 },
  { symbol: 'SHW', name: 'Sherwin-Williams', sector: 'Materials', marketCap: 85 },
  { symbol: 'FCX', name: 'Freeport-McMoRan', sector: 'Materials', marketCap: 60 },
  { symbol: 'NEM', name: 'Newmont', sector: 'Materials', marketCap: 50 },
];

export const ALL_TRACKED_SYMBOLS = [
  ...US_INDICES.map(i => i.symbol),
  ...INTL_INDICES.map(i => i.symbol),
  ...SECTORS.map(s => s.etf),
  ...Object.values(ENERGY_EQUITIES).flat(),
  ...ENERGY_COMMODITIES.map(c => c.symbol),
  ...Object.values(COMMODITIES).flat().map(c => c.symbol),
  ...FX_PAIRS.map(p => p.symbol),
  ...BONDS.map(b => b.symbol),
  ...CRYPTO,
  ...SP500_COMPANIES.map(c => c.symbol),
].filter((v, i, a) => a.indexOf(v) === i); // deduplicate
