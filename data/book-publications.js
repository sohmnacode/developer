// Book destinations are publisher, author, catalog, or public-domain records.
const google = (slug, id) => ({ url:`https://books.google.com/books/about/${slug}.html?id=${id}`, source:'Google Books' });
export const bookLinks = {
  'Life After Life': { url:'https://www.penguin.co.uk/books/345782/life-after-life-by-moody-ray/9781846046988', source:'Penguin' },
  'At the Hour of Death': google('At_the_Hour_of_Death','yAApAAAAYAAJ'),
  'Life at Death': google('Life_at_Death','sPh3AAAACAAJ'),
  'Heading Toward Omega': google('Heading_Toward_Omega','NT7uAAAAMAAJ'),
  'Consciousness Beyond Life': google('Consciousness_Beyond_Life','AzRFmAZnJCMC'),
  'Erasing Death': google('Erasing_Death','RClMhtjDfe8C'),
  'After': google('After','ZdLtDwAAQBAJ'),
  'Mindsight': google('Mindsight','4Is1OBhADfYC'),
  'Twenty Cases Suggestive of Reincarnation': { url:'https://www.upress.virginia.edu/title/3037/', source:'UVA Press' },
  'Children Who Remember Previous Lives': google('Children_who_Remember_Previous_Lives','1cEoAAAAYAAJ'),
  'Reincarnation and Biology (2 vols.)': google('Reincarnation_and_Biology','fkOtQgAACAAJ'),
  'Where Reincarnation and Biology Intersect': google('Where_Reincarnation_and_Biology_Intersec','VDifR2RT9AkC'),
  'Life Before Life': google('Life_Before_Life','dhTJzv_K5A0C'),
  'Return to Life': google('Return_to_Life','tRw5AAAAQBAJ'),
  'The Conscious Mind': { url:'https://consc.net/the-conscious-mind/', source:'Author website' },
  "The Emperor's New Mind": google('The_Emperor_s_New_Mind','EdADywkkOeUC'),
  'Shadows of the Mind': google('Shadows_of_the_Mind','gDbOAK89tmcC'),
  'The Feeling of Life Itself': google('The_Feeling_of_Life_Itself','jNCMEAAAQBAJ'),
  'Being No One': google('Being_No_One','COYWQ_7Nla4C'),
  'DMT: The Spirit Molecule': { url:'https://www.rickstrassman.com/publications/the-spirit-molecule/', source:'Author website' },
  'How to Change Your Mind': google('How_to_Change_Your_Mind','c76OEAAAQBAJ'),
  'The Varieties of Religious Experience': { url:'https://www.gutenberg.org/ebooks/621', source:'Project Gutenberg' },
  'The Reality of ESP': google('The_Reality_of_ESP','mYimPV9uETcC'),
  'Margins of Reality': google('Margins_of_Reality','Y57cAAAAIAAJ'),
  'Entangled Minds': google('Entangled_Minds','VgUklAEACAAJ'),
  'The Science Delusion (Science Set Free)': { url:'https://www.sheldrake.org/books-by-rupert-sheldrake/the-science-delusion-science-set-free', source:'Author website' },
};

export const authorLinks = {
  'Raymond Moody':'/researcher/raymond-moody',
  'Kenneth Ring':'/researcher/kenneth-ring',
  'Pim van Lommel':'/researcher/pim-van-lommel',
  'Sam Parnia':'/researcher/sam-parnia',
  'Bruce Greyson':'/researcher/bruce-greyson',
  'Ian Stevenson':'/researcher/ian-stevenson',
  'Jim Tucker':'/researcher/jim-tucker',
  'David Chalmers':'/researcher/david-chalmers',
  'Christof Koch':'/researcher/christof-koch',
  'Dean Radin':'/researcher/dean-radin',
  'Rupert Sheldrake':'/researcher/rupert-sheldrake',
};

export function bookAuthors(author) {
  return author.split(' and ').map(name => ({ name, url: authorLinks[name] || `/book-publications?author=${encodeURIComponent(name)}` }));
}
