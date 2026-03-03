export const FOOD_DATABASE = [
  { name: 'Pasta di semola', category: 'Cereali', factors: { bollito: 2.0 }, tip: 'Scola al dente per un indice glicemico più basso.' },
  { name: 'Riso basmati', category: 'Cereali', factors: { bollito: 2.3, pilaf: 2.5 } },
  { name: 'Cous cous', category: 'Cereali', factors: { assorbimento: 2.5, vapore: 2.3 } },
  { name: 'Pollo (petto)', category: 'Carne', factors: { piastra: 0.85, arrosto: 0.9 } },
  { name: 'Tacchino (petto)', category: 'Carne', factors: { piastra: 0.85, bollito: 1.0 } },
  { name: 'Salmone', category: 'Pesce', factors: { forno: 0.85, piastra: 0.8 } },
  { name: 'Merluzzo', category: 'Pesce', factors: { bollito: 0.85, arrosto: 0.7 } },
  { name: 'Ceci secchi', category: 'Legumi secchi', factors: { bollito: 3.0 } },
  { name: 'Lenticchie secche', category: 'Legumi secchi', factors: { bollito: 2.5 } },
  { name: 'Zucchine', category: 'Verdure', factors: { bollito: 0.9, arrosto: 0.4 } },
  { name: 'Spinaci', category: 'Verdure', factors: { bollito: 0.8, vapore: 0.85 } },
  { name: 'Patate', category: 'Verdure', factors: { bollito: 1.0, forno: 0.75 } },
];

export const convertWeight = ({ weight, factor, rawToCooked }) => {
  if (!factor || !weight) return 0;
  return rawToCooked ? Math.round(weight * factor) : Math.round(weight / factor);
};
