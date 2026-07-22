export interface Era {
  id: string
  index: number
  years: string
  yearStart: number
  kicker: string
  title: string
  body: string
  facts: { dt: string; dd: string }[]
}

export const ERAS: Era[] = [
  {
    id: 'barter',
    index: 1,
    years: 'c. 1780s',
    yearStart: 1780,
    kicker: 'CH 01 / BARTER',
    title: 'Before money had a face, it had a witness.',
    body:
      'Along the Swahili coast, value was negotiated in cowrie strings, measures of grain and salt, and lengths of cloth; the bright kanga would join that language in the nineteenth century. Inland caravans carried goods, credit and trust between port towns and the interior, where every exchange still depended on weight, count and witness.',
    facts: [
      { dt: 'ERA', dd: 'c. 1780s · Swahili coast' },
      { dt: 'ACCOUNT', dd: 'cowrie strings · counted by hand' },
      { dt: 'ROUTE', dd: 'coast ↔ interior · caravan exchange' },
    ],
  },
  {
    id: 'coin',
    index: 2,
    years: '1800s',
    yearStart: 1800,
    kicker: 'CH 02 / COIN',
    title: 'A coin crossed borders without asking their names.',
    body:
      'From Zanzibar and Mombasa into the interior, the Maria Theresa thaler became trusted by silver weight long after empires and issuers changed. Its portrait stayed familiar, its 1780 date was frozen, and trade kept it moving through East Africa for generations.',
    facts: [
      { dt: 'FIRST MINTED', dd: '1741 · Vienna' },
      { dt: 'RESTRIKE DATE', dd: '1780 · frozen' },
      { dt: 'SPECIFICATION', dd: '28.07 g · 0.833 silver' },
    ],
  },
  {
    id: 'paper',
    index: 3,
    years: '1921—1966',
    yearStart: 1921,
    kicker: 'CH 03 / PAPER',
    title: 'The promise moved onto paper.',
    body:
      'In 1921, the East African Currency Board placed a common shilling into circulation across Kenya, Uganda and Tanganyika, turning regional trust into engraved paper. Independent Kenya issued its own shilling in 1966: intaglio lines, serial numbers and state authority pressed into every note.',
    facts: [
      { dt: 'BOARD CURRENCY', dd: '1921 · East African shilling' },
      { dt: 'NATIONAL ISSUE', dd: '1966 · Kenya shilling' },
      { dt: 'PRINT SIGNAL', dd: 'intaglio · raised ink' },
    ],
  },
  {
    id: 'plastic',
    index: 4,
    years: '1989—2006',
    yearStart: 1989,
    kicker: 'CH 04 / PLASTIC',
    title: 'The bank learned to keep night hours.',
    body:
      "By the 1990s, Nairobi's ATM vestibules gave the bank a night shift: a card, a PIN, cash after the counters closed. Magnetic stripes and embossed numbers first carried the instruction; EMV chips later moved verification into the card itself.",
    facts: [
      { dt: 'ACCESS WINDOW', dd: '24 hours · ATM network' },
      { dt: 'AUTHENTICATION', dd: 'card + PIN' },
      { dt: 'EMV STANDARD', dd: '1994 · chip verification' },
    ],
  },
  {
    id: 'mobile',
    index: 5,
    years: '2007—2019',
    yearStart: 2007,
    kicker: 'CH 05 / MOBILE',
    title: 'A kiosk became a branch.',
    body:
      'In March 2007, M-Pesa launched in Kenya and made the basic handset a way to send and receive value. Short-code and SIM-toolkit menus—joined across mobile money by USSD—worked without a smartphone, while agent kiosks turned neighbourhood shops into cash-in, cash-out points.',
    facts: [
      { dt: 'LAUNCHED', dd: 'MAR 2007 · Kenya' },
      { dt: 'HANDSET RAIL', dd: 'SIM toolkit · USSD' },
      { dt: 'LAST MILE', dd: 'agent kiosk · cash in/out' },
    ],
  },
  {
    id: 'crypto',
    index: 6,
    years: '2020—NOW',
    yearStart: 2020,
    kicker: 'CH 06 / CRYPTO',
    title: 'The ledger learned the shape of a constellation.',
    body:
      'SEACOM came ashore at Mombasa in 2009; EASSy followed in 2010, giving East Africa new undersea routes into the global network. By the 2020s, open ledgers could record and verify transfers across many machines at once—the oldest act of exchange, carried on a new kind of trust.',
    facts: [
      { dt: 'SEACOM LANDING', dd: '2009 · Mombasa' },
      { dt: 'EASSy SERVICE', dd: '2010 · East Africa' },
      { dt: 'LEDGER MODE', dd: 'open · distributed' },
    ],
  },
]
