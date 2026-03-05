export const FOOD_DATABASE = [
  // ═══════════════════════════════════════════════════════════
  // CEREALI E PASTA
  // ═══════════════════════════════════════════════════════════
  { name: 'Pasta di semola', category: 'Cereali e Pasta', factors: { bollita: 2.0, risottata: 2.2 }, tip: 'Scola al dente per un indice glicemico più basso.' },
  { name: 'Pasta integrale', category: 'Cereali e Pasta', factors: { bollita: 1.9, risottata: 2.1 } },
  { name: 'Pasta all\'uovo', category: 'Cereali e Pasta', factors: { bollita: 2.1, risottata: 2.3 } },
  { name: 'Pasta fresca', category: 'Cereali e Pasta', factors: { bollita: 1.5, risottata: 1.7 } },
  { name: 'Gnocchi di patate', category: 'Cereali e Pasta', factors: { bolliti: 1.1 } },
  { name: 'Riso bianco', category: 'Cereali e Pasta', factors: { bollito: 2.5, pilaf: 2.7, risotto: 3.0 } },
  { name: 'Riso basmati', category: 'Cereali e Pasta', factors: { bollito: 2.3, pilaf: 2.5 } },
  { name: 'Riso integrale', category: 'Cereali e Pasta', factors: { bollito: 2.2, pilaf: 2.4 } },
  { name: 'Riso arborio', category: 'Cereali e Pasta', factors: { risotto: 3.0, bollito: 2.6 } },
  { name: 'Riso venere', category: 'Cereali e Pasta', factors: { bollito: 2.3, pilaf: 2.5 } },
  { name: 'Farro', category: 'Cereali e Pasta', factors: { bollito: 2.5, risottato: 2.7 } },
  { name: 'Orzo', category: 'Cereali e Pasta', factors: { bollito: 2.6, risottato: 2.8 } },
  { name: 'Quinoa', category: 'Cereali e Pasta', factors: { bollita: 2.8, vapore: 2.6 } },
  { name: 'Cous cous', category: 'Cereali e Pasta', factors: { assorbimento: 2.5, vapore: 2.3 } },
  { name: 'Bulgur', category: 'Cereali e Pasta', factors: { assorbimento: 2.4, bollito: 2.6 } },
  { name: 'Avena fiocchi', category: 'Cereali e Pasta', factors: { porridge: 3.5, overnight: 2.5 } },
  { name: 'Polenta', category: 'Cereali e Pasta', factors: { bollita: 5.0 }, tip: 'La polenta assorbe molta acqua durante la cottura.' },
  { name: 'Miglio', category: 'Cereali e Pasta', factors: { bollito: 3.0, vapore: 2.8 } },
  { name: 'Amaranto', category: 'Cereali e Pasta', factors: { bollito: 2.5 } },
  { name: 'Grano saraceno', category: 'Cereali e Pasta', factors: { bollito: 2.2 } },

  // ═══════════════════════════════════════════════════════════
  // CARNE BIANCA
  // ═══════════════════════════════════════════════════════════
  { name: 'Pollo petto', category: 'Carne Bianca', factors: { piastra: 0.75, arrosto: 0.70, bollito: 0.85, vapore: 0.88, affettato: 0.72 } },
  { name: 'Pollo coscia', category: 'Carne Bianca', factors: { arrosto: 0.65, piastra: 0.70, bollito: 0.80 } },
  { name: 'Pollo ali', category: 'Carne Bianca', factors: { arrosto: 0.60, fritto: 0.55 } },
  { name: 'Tacchino petto', category: 'Carne Bianca', factors: { piastra: 0.75, arrosto: 0.70, bollito: 0.85, affettato: 0.72 } },
  { name: 'Tacchino coscia', category: 'Carne Bianca', factors: { arrosto: 0.68, brasato: 0.72 } },
  { name: 'Coniglio', category: 'Carne Bianca', factors: { arrosto: 0.65, brasato: 0.70, bollito: 0.80 } },
  { name: 'Faraona', category: 'Carne Bianca', factors: { arrosto: 0.68, brasata: 0.72 } },
  { name: 'Anatra petto', category: 'Carne Bianca', factors: { arrosto: 0.60, piastra: 0.65 } },

  // ═══════════════════════════════════════════════════════════
  // CARNE ROSSA
  // ═══════════════════════════════════════════════════════════
  { name: 'Manzo filetto', category: 'Carne Rossa', factors: { piastra: 0.75, arrosto: 0.70, brasato: 0.65 } },
  { name: 'Manzo controfiletto', category: 'Carne Rossa', factors: { piastra: 0.72, arrosto: 0.68 } },
  { name: 'Manzo macinato', category: 'Carne Rossa', factors: { padella: 0.70, piastra: 0.68, polpette: 0.75 } },
  { name: 'Manzo brasato', category: 'Carne Rossa', factors: { brasato: 0.60, stufato: 0.65 } },
  { name: 'Vitello fesa', category: 'Carne Rossa', factors: { piastra: 0.78, arrosto: 0.72, scaloppina: 0.75 } },
  { name: 'Vitello ossobuco', category: 'Carne Rossa', factors: { brasato: 0.70, stufato: 0.72 } },
  { name: 'Maiale lonza', category: 'Carne Rossa', factors: { piastra: 0.72, arrosto: 0.68, padella: 0.70 } },
  { name: 'Maiale filetto', category: 'Carne Rossa', factors: { arrosto: 0.70, piastra: 0.75 } },
  { name: 'Maiale costine', category: 'Carne Rossa', factors: { arrosto: 0.55, griglia: 0.50, brasato: 0.60 } },
  { name: 'Agnello coscia', category: 'Carne Rossa', factors: { arrosto: 0.65, brasato: 0.70 } },
  { name: 'Agnello costolette', category: 'Carne Rossa', factors: { piastra: 0.70, arrosto: 0.65, griglia: 0.68 } },
  { name: 'Cavallo', category: 'Carne Rossa', factors: { piastra: 0.75, tartare: 1.0, brasato: 0.68 } },

  // ═══════════════════════════════════════════════════════════
  // PESCE
  // ═══════════════════════════════════════════════════════════
  { name: 'Salmone filetto', category: 'Pesce', factors: { forno: 0.82, piastra: 0.78, vapore: 0.88, crudo: 1.0 } },
  { name: 'Tonno fresco', category: 'Pesce', factors: { piastra: 0.80, forno: 0.78, crudo: 1.0, tataki: 0.90 } },
  { name: 'Merluzzo', category: 'Pesce', factors: { bollito: 0.85, forno: 0.78, vapore: 0.88, padella: 0.75 } },
  { name: 'Orata', category: 'Pesce', factors: { forno: 0.75, piastra: 0.70, vapore: 0.85, sale: 0.72 } },
  { name: 'Branzino', category: 'Pesce', factors: { forno: 0.75, piastra: 0.70, vapore: 0.85, sale: 0.72 } },
  { name: 'Sogliola', category: 'Pesce', factors: { padella: 0.78, forno: 0.75, vapore: 0.85 } },
  { name: 'Trota', category: 'Pesce', factors: { forno: 0.78, piastra: 0.75, vapore: 0.85 } },
  { name: 'Sgombro', category: 'Pesce', factors: { piastra: 0.75, forno: 0.72, affumicato: 0.60 } },
  { name: 'Sardine', category: 'Pesce', factors: { piastra: 0.70, forno: 0.68, fritte: 0.65 } },
  { name: 'Acciughe', category: 'Pesce', factors: { fritte: 0.65, piastra: 0.70 } },
  { name: 'Pesce spada', category: 'Pesce', factors: { piastra: 0.78, forno: 0.75, griglia: 0.72 } },
  { name: 'Halibut', category: 'Pesce', factors: { forno: 0.80, piastra: 0.78, vapore: 0.88 } },
  { name: 'Rombo', category: 'Pesce', factors: { forno: 0.78, vapore: 0.85, piastra: 0.75 } },
  { name: 'Baccalà ammollato', category: 'Pesce', factors: { forno: 0.80, bollito: 0.85, fritto: 0.70 }, tip: 'Partire dal peso già ammollato.' },
  { name: 'Platessa', category: 'Pesce', factors: { padella: 0.75, forno: 0.72, vapore: 0.85 } },

  // ═══════════════════════════════════════════════════════════
  // FRUTTI DI MARE E CROSTACEI
  // ═══════════════════════════════════════════════════════════
  { name: 'Gamberi', category: 'Frutti di Mare', factors: { bolliti: 0.85, piastra: 0.75, padella: 0.78, crudi: 1.0 } },
  { name: 'Gamberoni', category: 'Frutti di Mare', factors: { piastra: 0.72, forno: 0.70, bolliti: 0.82 } },
  { name: 'Scampi', category: 'Frutti di Mare', factors: { piastra: 0.70, bolliti: 0.80, crudi: 1.0 } },
  { name: 'Calamari', category: 'Frutti di Mare', factors: { piastra: 0.70, fritti: 0.65, bolliti: 0.80, brasati: 0.75 } },
  { name: 'Polpo', category: 'Frutti di Mare', factors: { bollito: 0.50, piastra: 0.45, brasato: 0.52 }, tip: 'Il polpo perde molto peso in cottura.' },
  { name: 'Seppie', category: 'Frutti di Mare', factors: { piastra: 0.65, brasate: 0.70, fritte: 0.60 } },
  { name: 'Cozze (sgusciate)', category: 'Frutti di Mare', factors: { vapore: 0.85, padella: 0.80 } },
  { name: 'Vongole (sgusciate)', category: 'Frutti di Mare', factors: { vapore: 0.85, padella: 0.80 } },
  { name: 'Capesante', category: 'Frutti di Mare', factors: { piastra: 0.80, forno: 0.78 } },
  { name: 'Aragosta', category: 'Frutti di Mare', factors: { bollita: 0.78, piastra: 0.72, forno: 0.75 } },
  { name: 'Granchio (polpa)', category: 'Frutti di Mare', factors: { bollito: 0.90, vapore: 0.92 } },

  // ═══════════════════════════════════════════════════════════
  // LEGUMI SECCHI
  // ═══════════════════════════════════════════════════════════
  { name: 'Ceci secchi', category: 'Legumi', factors: { bolliti: 2.5, pentola_pressione: 2.4 }, tip: 'Ammollare 12h prima della cottura.' },
  { name: 'Lenticchie secche', category: 'Legumi', factors: { bollite: 2.3, pentola_pressione: 2.2 } },
  { name: 'Lenticchie rosse', category: 'Legumi', factors: { bollite: 2.0 }, tip: 'Non richiedono ammollo.' },
  { name: 'Fagioli borlotti secchi', category: 'Legumi', factors: { bolliti: 2.5, pentola_pressione: 2.4 } },
  { name: 'Fagioli cannellini secchi', category: 'Legumi', factors: { bolliti: 2.4, pentola_pressione: 2.3 } },
  { name: 'Fagioli neri secchi', category: 'Legumi', factors: { bolliti: 2.3, pentola_pressione: 2.2 } },
  { name: 'Fagioli rossi secchi', category: 'Legumi', factors: { bolliti: 2.4, pentola_pressione: 2.3 } },
  { name: 'Fave secche', category: 'Legumi', factors: { bollite: 2.8, pentola_pressione: 2.6 } },
  { name: 'Piselli secchi', category: 'Legumi', factors: { bolliti: 2.2, pentola_pressione: 2.0 } },
  { name: 'Soia gialla secca', category: 'Legumi', factors: { bollita: 2.5 } },
  { name: 'Azuki secchi', category: 'Legumi', factors: { bolliti: 2.3 } },
  { name: 'Lupini secchi', category: 'Legumi', factors: { bolliti: 2.0 } },

  // ═══════════════════════════════════════════════════════════
  // VERDURE A FOGLIA
  // ═══════════════════════════════════════════════════════════
  { name: 'Spinaci', category: 'Verdure', factors: { bolliti: 0.35, vapore: 0.40, saltati: 0.38 }, tip: 'Gli spinaci si riducono molto in cottura.' },
  { name: 'Bietole', category: 'Verdure', factors: { bollite: 0.45, vapore: 0.50, saltate: 0.42 } },
  { name: 'Cicoria', category: 'Verdure', factors: { bollita: 0.50, saltata: 0.45 } },
  { name: 'Cime di rapa', category: 'Verdure', factors: { bollite: 0.55, saltate: 0.50 } },
  { name: 'Catalogna', category: 'Verdure', factors: { bollita: 0.55, saltata: 0.50 } },
  { name: 'Verza', category: 'Verdure', factors: { bollita: 0.70, brasata: 0.65, vapore: 0.75 } },
  { name: 'Cavolo cappuccio', category: 'Verdure', factors: { bollito: 0.75, brasato: 0.70, vapore: 0.80 } },
  { name: 'Cavolo nero', category: 'Verdure', factors: { bollito: 0.50, saltato: 0.45 } },

  // ═══════════════════════════════════════════════════════════
  // VERDURE
  // ═══════════════════════════════════════════════════════════
  { name: 'Zucchine', category: 'Verdure', factors: { piastra: 0.55, forno: 0.50, vapore: 0.85, trifolate: 0.60 } },
  { name: 'Melanzane', category: 'Verdure', factors: { piastra: 0.45, forno: 0.40, fritte: 0.35, brasate: 0.50 } },
  { name: 'Peperoni', category: 'Verdure', factors: { arrosto: 0.50, piastra: 0.60, forno: 0.55, crudi: 1.0 } },
  { name: 'Pomodori', category: 'Verdure', factors: { forno: 0.60, piastra: 0.65, crudi: 1.0 } },
  { name: 'Carote', category: 'Verdure', factors: { bollite: 0.90, vapore: 0.92, arrosto: 0.75, crude: 1.0 } },
  { name: 'Finocchi', category: 'Verdure', factors: { bolliti: 0.85, gratinati: 0.70, brasati: 0.75 } },
  { name: 'Sedano', category: 'Verdure', factors: { bollito: 0.85, brasato: 0.75, crudo: 1.0 } },
  { name: 'Carciofi', category: 'Verdure', factors: { bolliti: 0.80, arrosto: 0.65, trifolati: 0.70, fritti: 0.60 } },
  { name: 'Asparagi', category: 'Verdure', factors: { bolliti: 0.85, vapore: 0.90, piastra: 0.75, forno: 0.70 } },
  { name: 'Fagiolini', category: 'Verdure', factors: { bolliti: 0.90, vapore: 0.92, saltati: 0.85 } },
  { name: 'Piselli freschi', category: 'Verdure', factors: { bolliti: 0.90, vapore: 0.92, saltati: 0.88 } },
  { name: 'Broccoli', category: 'Verdure', factors: { bolliti: 0.75, vapore: 0.80, arrosto: 0.60, saltati: 0.70 } },
  { name: 'Cavolfiore', category: 'Verdure', factors: { bollito: 0.80, vapore: 0.85, arrosto: 0.65, gratinato: 0.70 } },
  { name: 'Cavolini di Bruxelles', category: 'Verdure', factors: { bolliti: 0.80, arrosto: 0.65, vapore: 0.85 } },
  { name: 'Porri', category: 'Verdure', factors: { bolliti: 0.70, brasati: 0.65, gratinati: 0.60 } },
  { name: 'Cipolla', category: 'Verdure', factors: { saltata: 0.50, caramellata: 0.40, arrosto: 0.55 } },
  { name: 'Funghi champignon', category: 'Verdure', factors: { trifolati: 0.35, piastra: 0.40, arrosto: 0.35 } },
  { name: 'Funghi porcini', category: 'Verdure', factors: { trifolati: 0.40, piastra: 0.45, arrosto: 0.40 } },
  { name: 'Zucca', category: 'Verdure', factors: { forno: 0.70, vapore: 0.85, bollita: 0.80 } },

  // ═══════════════════════════════════════════════════════════
  // TUBERI E PATATE
  // ═══════════════════════════════════════════════════════════
  { name: 'Patate', category: 'Tuberi', factors: { bollite: 1.0, forno: 0.80, fritte: 0.65, vapore: 0.95, purea: 1.2 }, tip: 'Le patate assorbono acqua in bollitura.' },
  { name: 'Patate dolci', category: 'Tuberi', factors: { forno: 0.75, bollite: 0.88, vapore: 0.90 } },
  { name: 'Topinambur', category: 'Tuberi', factors: { forno: 0.70, bollito: 0.85, trifolato: 0.65 } },
  { name: 'Rape', category: 'Tuberi', factors: { bollite: 0.85, forno: 0.70 } },
  { name: 'Barbabietole', category: 'Tuberi', factors: { bollite: 0.85, forno: 0.75 } },

  // ═══════════════════════════════════════════════════════════
  // UOVA E DERIVATI
  // ═══════════════════════════════════════════════════════════
  { name: 'Uovo intero', category: 'Uova', factors: { sodo: 1.0, camicia: 0.95, fritto: 0.90, strapazzato: 0.85 }, tip: 'Il peso dell\'uovo varia poco in cottura.' },
  { name: 'Albume', category: 'Uova', factors: { bollito: 0.95, montato: 3.0, fritto: 0.80 } },
  { name: 'Tuorlo', category: 'Uova', factors: { sodo: 0.95 } },

  // ═══════════════════════════════════════════════════════════
  // TOFU E SOI
  // ═══════════════════════════════════════════════════════════
  { name: 'Tofu', category: 'Proteine Vegetali', factors: { piastra: 0.85, forno: 0.80, fritto: 0.75, saltato: 0.82 } },
  { name: 'Tempeh', category: 'Proteine Vegetali', factors: { piastra: 0.88, forno: 0.85, saltato: 0.85 } },
  { name: 'Seitan', category: 'Proteine Vegetali', factors: { piastra: 0.82, forno: 0.78, brasato: 0.80 } },

  // ═══════════════════════════════════════════════════════════
  // FRUTTA COTTA
  // ═══════════════════════════════════════════════════════════
  { name: 'Mele', category: 'Frutta', factors: { forno: 0.80, composta: 0.75, caramellate: 0.70 } },
  { name: 'Pere', category: 'Frutta', factors: { forno: 0.80, composta: 0.75, caramellate: 0.70 } },
  { name: 'Pesche', category: 'Frutta', factors: { piastra: 0.85, forno: 0.80 } },
  { name: 'Prugne secche', category: 'Frutta', factors: { ammollate: 2.0, composta: 1.8 } },
  { name: 'Albicocche secche', category: 'Frutta', factors: { ammollate: 2.2, composta: 2.0 } },
  { name: 'Fichi secchi', category: 'Frutta', factors: { ammollati: 1.8 } },
  { name: 'Uvetta', category: 'Frutta', factors: { ammollata: 1.5 } },

  // ═══════════════════════════════════════════════════════════
  // CEREALI, PANE E FORNO
  // ═══════════════════════════════════════════════════════════
  { name: 'Pane bianco', category: 'Cereali e Pasta', factors: { tostato: 0.90, bruschetta: 0.88, piastra: 0.92 } },
  { name: 'Pane integrale', category: 'Cereali e Pasta', factors: { tostato: 0.92, bruschetta: 0.90, piastra: 0.94 } },
  { name: 'Pane di segale', category: 'Cereali e Pasta', factors: { tostato: 0.93, bruschetta: 0.91 } },
  { name: 'Focaccia', category: 'Cereali e Pasta', factors: { forno: 0.88, piastra: 0.90 } },
  { name: 'Piadina', category: 'Cereali e Pasta', factors: { piastra: 0.92, forno: 0.90 } },
  { name: 'Pizza impasto', category: 'Cereali e Pasta', factors: { forno: 0.85, teglia: 0.87 } },
  { name: 'Lasagne secche', category: 'Cereali e Pasta', factors: { forno: 2.2, bollite: 2.0 } },
  { name: 'Crespelle', category: 'Cereali e Pasta', factors: { padella: 0.95, forno: 0.90 } },
  { name: 'Semolino', category: 'Cereali e Pasta', factors: { crema: 4.0, gnocchi: 2.6 } },
  { name: 'Riso per sushi', category: 'Cereali e Pasta', factors: { bollito: 2.4, assorbimento: 2.6 } },
  { name: 'Riso jasmine', category: 'Cereali e Pasta', factors: { bollito: 2.3, pilaf: 2.5 } },
  { name: 'Riso parboiled', category: 'Cereali e Pasta', factors: { bollito: 2.2, pilaf: 2.4 } },
  { name: 'Noodles secchi', category: 'Cereali e Pasta', factors: { bolliti: 2.3, saltati: 2.0 } },
  { name: 'Spaghetti di riso secchi', category: 'Cereali e Pasta', factors: { bolliti: 2.5, wok: 2.2 } },

  // ═══════════════════════════════════════════════════════════
  // CARNE BIANCA E ROSSA AGGIUNTIVE
  // ═══════════════════════════════════════════════════════════
  { name: 'Pollo sovracoscia', category: 'Carne Bianca', factors: { forno: 0.68, piastra: 0.72, padella: 0.70 } },
  { name: 'Pollo intero', category: 'Carne Bianca', factors: { arrosto: 0.67, forno: 0.69, bollito: 0.82 } },
  { name: 'Tacchino arrosto', category: 'Carne Bianca', factors: { arrosto: 0.70, piastra: 0.74 } },
  { name: 'Coniglio disossato', category: 'Carne Bianca', factors: { forno: 0.68, brasato: 0.72, padella: 0.70 } },
  { name: 'Hamburger di manzo', category: 'Carne Rossa', factors: { piastra: 0.78, padella: 0.75, forno: 0.80 } },
  { name: 'Bresaola', category: 'Carne Rossa', factors: { naturale: 1.0, piastra: 0.95 } },
  { name: 'Roastbeef', category: 'Carne Rossa', factors: { arrosto: 0.72, padella: 0.75 } },
  { name: 'Salsiccia fresca', category: 'Carne Rossa', factors: { piastra: 0.70, forno: 0.68, padella: 0.72 } },
  { name: 'Spezzatino di manzo', category: 'Carne Rossa', factors: { stufato: 0.65, brasato: 0.62 } },
  { name: 'Fegato bovino', category: 'Carne Rossa', factors: { padella: 0.78, piastra: 0.75 } },

  // ═══════════════════════════════════════════════════════════
  // PESCE AGGIUNTIVO
  // ═══════════════════════════════════════════════════════════
  { name: 'Nasello', category: 'Pesce', factors: { vapore: 0.88, forno: 0.80, bollito: 0.86 } },
  { name: 'Cernia', category: 'Pesce', factors: { forno: 0.78, piastra: 0.75, vapore: 0.86 } },
  { name: 'Ricciola', category: 'Pesce', factors: { piastra: 0.80, forno: 0.77, crudo: 1.0 } },
  { name: 'Spigola', category: 'Pesce', factors: { forno: 0.75, piastra: 0.72, vapore: 0.85 } },
  { name: 'Palamita', category: 'Pesce', factors: { piastra: 0.78, forno: 0.75, umido: 0.82 } },
  { name: 'Cefalo', category: 'Pesce', factors: { forno: 0.76, piastra: 0.73, vapore: 0.84 } },
  { name: 'Totani', category: 'Frutti di Mare', factors: { piastra: 0.68, padella: 0.72, fritti: 0.62 } },
  { name: 'Moscardini', category: 'Frutti di Mare', factors: { umido: 0.60, piastra: 0.55, bolliti: 0.65 } },

  // ═══════════════════════════════════════════════════════════
  // LEGUMI E PROTEINE VEGETALI AGGIUNTIVE
  // ═══════════════════════════════════════════════════════════
  { name: 'Ceci cotti', category: 'Legumi', factors: { saltati: 0.95, umido: 1.05, forno: 0.90 } },
  { name: 'Lenticchie cotte', category: 'Legumi', factors: { umido: 1.05, saltate: 0.95, zuppa: 1.15 } },
  { name: 'Fagioli cannellini cotti', category: 'Legumi', factors: { umido: 1.05, saltati: 0.95, crema: 1.10 } },
  { name: 'Fagioli borlotti cotti', category: 'Legumi', factors: { umido: 1.05, saltati: 0.95, crema: 1.10 } },
  { name: 'Edamame', category: 'Legumi', factors: { bolliti: 1.05, vapore: 1.02, saltati: 0.95 } },
  { name: 'Burger vegetale', category: 'Proteine Vegetali', factors: { piastra: 0.88, forno: 0.85, padella: 0.90 } },

  // ═══════════════════════════════════════════════════════════
  // VERDURE AGGIUNTIVE COMUNI
  // ═══════════════════════════════════════════════════════════
  { name: 'Pomodorini', category: 'Verdure', factors: { forno: 0.65, padella: 0.72, crudi: 1.0 } },
  { name: 'Lattuga', category: 'Verdure', factors: { cruda: 1.0, grigliata: 0.85 } },
  { name: 'Radicchio', category: 'Verdure', factors: { piastra: 0.72, forno: 0.68, crudo: 1.0 } },
  { name: 'Rucola', category: 'Verdure', factors: { cruda: 1.0, saltata: 0.70 } },
  { name: 'Cetrioli', category: 'Verdure', factors: { crudi: 1.0, agrodolce: 0.95 } },
  { name: 'Melanzane a cubetti', category: 'Verdure', factors: { forno: 0.45, padella: 0.50, fritte: 0.36 } },
  { name: 'Zucchine a rondelle', category: 'Verdure', factors: { padella: 0.62, forno: 0.55, vapore: 0.86 } },
  { name: 'Peperoni a listarelle', category: 'Verdure', factors: { padella: 0.62, forno: 0.58, griglia: 0.55 } },
  { name: 'Patate novelle', category: 'Tuberi', factors: { forno: 0.82, bollite: 0.98, vapore: 0.95 } },
  { name: 'Purea di patate in fiocchi', category: 'Tuberi', factors: { reidratata: 4.5 } },
  { name: 'Mais in chicchi', category: 'Verdure', factors: { bollito: 1.05, piastra: 0.95, vapore: 1.02 } },
  { name: 'Piselli surgelati', category: 'Verdure', factors: { bolliti: 1.0, padella: 0.92, vapore: 0.98 } },
  { name: 'Cime di cavolfiore', category: 'Verdure', factors: { vapore: 0.86, forno: 0.68, bollite: 0.82 } },
  { name: 'Broccoletti', category: 'Verdure', factors: { vapore: 0.82, bolliti: 0.78, padella: 0.72 } },

  // ═══════════════════════════════════════════════════════════
  // UOVA, LATTICINI, PREPARAZIONI
  // ═══════════════════════════════════════════════════════════
  { name: 'Frittata', category: 'Uova', factors: { padella: 0.85, forno: 0.88 } },
  { name: 'Omelette', category: 'Uova', factors: { padella: 0.88, forno: 0.90 } },
  { name: 'Mozzarella', category: 'Latticini', factors: { forno: 0.85, piastra: 0.82, cruda: 1.0 } },
  { name: 'Ricotta', category: 'Latticini', factors: { forno: 0.92, padella: 0.88, cruda: 1.0 } },
  { name: 'Besciamella', category: 'Cereali e Pasta', factors: { ridotta: 0.85, gratinata: 0.80 } },
  { name: 'Passata di pomodoro', category: 'Verdure', factors: { ridotta: 0.65, sugo: 0.75, cruda: 1.0 } },

  // ═══════════════════════════════════════════════════════════
  // FRUTTA E PREPARAZIONI DOLCI AGGIUNTIVE
  // ═══════════════════════════════════════════════════════════
  { name: 'Banane', category: 'Frutta', factors: { forno: 0.82, piastra: 0.88, crude: 1.0 } },
  { name: 'Fragole', category: 'Frutta', factors: { composta: 0.70, crude: 1.0 } },
  { name: 'Frutti di bosco', category: 'Frutta', factors: { composta: 0.68, crudi: 1.0 } },
  { name: 'Mirtilli', category: 'Frutta', factors: { composta: 0.72, crudi: 1.0 } },
  { name: 'Pera cotta', category: 'Frutta', factors: { forno: 0.78, sciroppata: 1.1 } },
  { name: 'Mela cotta', category: 'Frutta', factors: { forno: 0.78, sciroppata: 1.1 } },
];

export const convertWeight = ({ weight, factor, rawToCooked }) => {
  if (!factor || !weight) return 0;
  return rawToCooked ? Math.round(weight * factor) : Math.round(weight / factor);
};

// Helper per capitalizzare il metodo di cottura
export const formatMethod = (method) => {
  const labels = {
    pentola_pressione: 'Pentola a pressione',
    assorbimento: 'Assorbimento',
    crudo: 'Crudo',
    cruda: 'Cruda',
    crudi: 'Crudi',
    crude: 'Crude',
    bollito: 'Bollito',
    bollita: 'Bollita',
    bolliti: 'Bolliti',
    bollite: 'Bollite',
    saltato: 'Saltato',
    saltata: 'Saltata',
    saltati: 'Saltati',
    saltate: 'Saltate',
    trifolato: 'Trifolato',
    trifolata: 'Trifolata',
    trifolati: 'Trifolati',
    trifolate: 'Trifolate',
    brasato: 'Brasato',
    brasata: 'Brasata',
    brasati: 'Brasati',
    brasate: 'Brasate',
    fritto: 'Fritto',
    fritta: 'Fritta',
    fritti: 'Fritti',
    fritte: 'Fritte',
    wok: 'Wok',
    pilaf: 'Pilaf',
    tataki: 'Tataki',
  };

  const key = String(method || '').trim().toLowerCase();
  if (!key) return '';
  if (labels[key]) return labels[key];

  return key
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase());
};
