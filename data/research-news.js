// Curated, dated research updates. Add an item only after checking its primary source.
export const newsReviewed = '2026-09-21';
export const researchNews = [
  {
    id: 'conscious-connectome-2026',
    published: '2026-09-10',
    category: 'Clinical consciousness',
    title: 'Brain-network patterns linked to signs of awareness after severe injury',
    summary: 'A study of 117 patients with disorders of consciousness and 30 healthy controls found that preserved communication between brain regions was associated with remaining behavioral signs of awareness. The authors also explored whether network patterns could help forecast recovery.',
    context: 'An association in this cohort; it does not establish an individual diagnosis or prove a general theory of consciousness.',
    source: 'Communications Medicine',
    url: 'https://www.nature.com/articles/s43856-026-01870-6',
  },
  {
    id: 'analog-cognition-2026',
    published: '2026-09-01',
    category: 'Consciousness theory',
    title: 'MIT team proposes a brain-wave account of cognition and consciousness',
    summary: 'Researchers argue that traveling electrical waves may coordinate flexible brain activity through analog computations. Their article presents a theory and identifies predictions for future tests.',
    context: 'This is a proposed explanation, not an experimental confirmation that brain waves generate conscious experience.',
    source: 'MIT News / The Journal of Neuroscience',
    url: 'https://news.mit.edu/2026/cognition-consciousness-arise-from-analog-computations-says-new-theory-0901',
  },
  {
    id: 'uva-intermission-2026',
    published: '2026-08-21',
    category: 'Reported past-life memories',
    title: 'UVA analyzes timing patterns in 1,678 reported past-life cases',
    summary: 'Researchers at UVA examined the time between a previous person’s death and a child’s birth in documented cases. They reported shorter median intervals after unexpected deaths.',
    context: 'The analysis concerns reported cases and an observed association; it does not verify reincarnation or explain the mechanism.',
    source: 'University of Virginia Division of Perceptual Studies',
    url: 'https://med.virginia.edu/perceptual-studies/2026/08/21/new-research-a-large-scale-analysis-of-temporal-patterns-in-childrens-purported-past-life-memories-shorter-intervals-following-unexpected-deaths/',
  },
];

export function isBreaking(published, now = new Date()) {
  const age = (now.getTime() - Date.parse(`${published}T00:00:00Z`)) / 86400000;
  return age >= 0 && age < 14;
}
