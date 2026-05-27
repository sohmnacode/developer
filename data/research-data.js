export const evidenceDomains = [
  { id:'nde', title:'Near-Death Experiences', tag:'Clinical evidence', strength:'Suggestive to strong', score:78, href:'/nde', claim:'Prospective cardiac-arrest studies, consistent phenomenology, and some veridical perception cases make NDEs one of the strongest survival-adjacent data sets.', supports:['Prospective hospital studies','Greyson NDE Scale','Cross-cultural consistency'], cautions:['Low survival/interview rates','Target-identification studies remain sparse','Timing of experience is difficult to prove'] },
  { id:'reincarnation', title:'Reincarnation Studies', tag:'Case research', strength:'Suggestive', score:70, href:'/reincarnation', claim:'Children who report previous-life memories sometimes provide verified details before normal information transfer is plausible.', supports:['UVA case protocols','Birthmark and birth-defect correlations','Early childhood spontaneous reports'], cautions:['Cultural reporting bias','Memory contamination after identification','Publication bias'] },
  { id:'psychedelics', title:'Psychedelic Research', tag:'Clinical trials', strength:'Well-supported for experience, speculative for metaphysics', score:66, href:'/psychedelics', claim:'Clinical studies robustly show mystical-type experiences and durable personality shifts; whether these contact an external reality remains open.', supports:['Controlled psilocybin trials','MEQ30 measurement','Durable therapeutic outcomes'], cautions:['Neural correlates are active during experience','Metaphysical claims exceed clinical findings','Set and setting strongly shape content'] },
  { id:'consciousness', title:'Consciousness Science', tag:'Theory', strength:'Open problem', score:58, href:'/consciousness', claim:'Mainstream theories explain access, report, and integration better than raw subjectivity; the hard problem remains unresolved.', supports:['IIT, GWT, recurrent processing','Neural correlates of consciousness','Philosophical precision'], cautions:['No consensus theory','Measurement remains indirect','Survival claims need separate evidence'] },
  { id:'nonlocal', title:'Non-Local Consciousness', tag:'Parapsychology', strength:'Contested', score:45, href:'/nonlocal', claim:'Some meta-analyses report above-chance psi effects, but replication quality and mechanism are heavily disputed.', supports:['Ganzfeld meta-analyses','Remote viewing archives','REG studies'], cautions:['Small effect sizes','File-drawer concerns','Methodological disputes'] },
  { id:'quantum', title:'Quantum Mind Theory', tag:'Quantum biology', strength:'Speculative', score:34, href:'/quantum', claim:'Quantum biology is real in some systems; extending it to consciousness remains a provocative but contested hypothesis.', supports:['Photosynthesis coherence','Avian magnetoreception','Orch OR proposal'], cautions:['Warm wet brain decoherence objections','Limited direct evidence','Quantum language is often overstated'] }
];

export const caseIndex = [
  { title:'Pam Reynolds', domain:'NDE', type:'Verified perception', strength:'Strong', location:'United States', year:'1991', tags:['clinical','obe','surgery'], summary:'Reported accurate surgical observations during hypothermic cardiac arrest with sensory blockade; documented by Michael Sabom.' },
  { title:'AWARE Study', domain:'NDE', type:'Prospective study', strength:'Moderate', location:'US/UK/Austria', year:'2014', tags:['cardiac arrest','prospective','veridical'], summary:'Sam Parnia-led study of cardiac arrest awareness; one auditory/visual sequence report was corroborated, while hidden visual targets were not identified.' },
  { title:'Pim van Lommel Lancet Study', domain:'NDE', type:'Prospective study', strength:'Strong', location:'Netherlands', year:'2001', tags:['cardiac arrest','longitudinal','lancet'], summary:'344 cardiac-arrest survivors; 18 percent reported NDE memories and long-term transformation not explained by measured medical variables.' },
  { title:'Mindsight', domain:'NDE', type:'Blind experiencers', strength:'Suggestive', location:'United States', year:'1999', tags:['blind','vision','phenomenology'], summary:'Kenneth Ring and Sharon Cooper studied NDE/OBE reports in blind people, including some blind from birth, with reports of visual perception.' },
  { title:'James Leininger', domain:'Reincarnation', type:'Child memory', strength:'Strong', location:'United States', year:'2000s', tags:['wwii','pilot','verified details'], summary:'A child gave specific WWII aviation details later connected to pilot James Huston Jr. and USS Natoma Bay.' },
  { title:'Shanti Devi', domain:'Reincarnation', type:'Child memory', strength:'Strong', location:'India', year:'1930s', tags:['cross-cultural','family recognition','field investigation'], summary:'A Delhi child described a prior life in Mathura and recognized people and locations during formal investigation.' },
  { title:'Ryan Hammons', domain:'Reincarnation', type:'Child memory', strength:'Moderate', location:'United States', year:'2010s', tags:['hollywood','photo identification','uva'], summary:'Claims about a Hollywood life were connected by Jim Tucker to Marty Martyn, a relatively obscure agent and extra.' },
  { title:'Imad Elawar', domain:'Reincarnation', type:'Child memory', strength:'Strong', location:'Lebanon', year:'1960s', tags:['stevenson','verified statements','field notes'], summary:'Ian Stevenson documented many specific statements before connecting the child to Ibrahim Bouhamzy.' },
  { title:'Johns Hopkins Psilocybin Mystical Experience Studies', domain:'Psychedelics', type:'Clinical trial', strength:'Strong', location:'United States', year:'2006+', tags:['psilocybin','mystical experience','clinical'], summary:'Controlled studies found high rates of personally meaningful mystical-type experience and lasting changes in attitude and behavior.' },
  { title:'SRI Remote Viewing', domain:'Nonlocal', type:'Remote viewing', strength:'Contested', location:'United States', year:'1972-1995', tags:['stargate','sri','classified'], summary:'Government-funded remote viewing research reported statistically significant results but remains disputed over method and operational utility.' },
  { title:'PEAR Lab REG Studies', domain:'Nonlocal', type:'Mind-matter interaction', strength:'Contested', location:'United States', year:'1979-2007', tags:['princeton','random event generators','small effects'], summary:'Princeton lab reported tiny but cumulative deviations in random event generators associated with operator intention.' },
  { title:'Orch OR', domain:'Quantum', type:'Theory', strength:'Speculative', location:'Oxford/Arizona', year:'1990s+', tags:['microtubules','penrose','hameroff'], summary:'Penrose and Hameroff propose quantum processes in microtubules as a basis for conscious moments; influential and heavily contested.' }
];

export const libraryItems = [
  { title:'Near-death experience in survivors of cardiac arrest', author:'Pim van Lommel et al.', year:'2001', kind:'Paper', domain:'NDE', note:'Prospective Dutch cardiac-arrest study published in The Lancet.' },
  { title:'AWARE: AWAreness during REsuscitation', author:'Sam Parnia et al.', year:'2014', kind:'Paper', domain:'NDE', note:'Multi-hospital prospective study of awareness during cardiac arrest.' },
  { title:'The Near-Death Experience Scale', author:'Bruce Greyson', year:'1983', kind:'Paper', domain:'NDE', note:'Core measurement instrument used across NDE research.' },
  { title:'Mindsight', author:'Kenneth Ring and Sharon Cooper', year:'1999', kind:'Book', domain:'NDE', note:'Study of NDE and OBE reports among blind experiencers.' },
  { title:'Twenty Cases Suggestive of Reincarnation', author:'Ian Stevenson', year:'1966', kind:'Book', domain:'Reincarnation', note:'Foundational field investigation volume.' },
  { title:'Reincarnation and Biology', author:'Ian Stevenson', year:'1997', kind:'Book', domain:'Reincarnation', note:'Large academic treatment of birthmarks and birth defects in cases.' },
  { title:'Return to Life', author:'Jim Tucker', year:'2013', kind:'Book', domain:'Reincarnation', note:'Modern UVA cases, including American children.' },
  { title:'Psilocybin can occasion mystical-type experiences', author:'Roland Griffiths et al.', year:'2006', kind:'Paper', domain:'Psychedelics', note:'Landmark Johns Hopkins controlled psilocybin study.' },
  { title:'Consciousness and its Place in Nature', author:'David Chalmers', year:'2003', kind:'Essay', domain:'Consciousness', note:'Clear framing of hard-problem options.' },
  { title:'Consciousness in the Universe', author:'Stuart Hameroff and Roger Penrose', year:'2014', kind:'Paper', domain:'Quantum', note:'Updated Orch OR argument and responses to criticism.' },
  { title:'The Reality of ESP', author:'Russell Targ', year:'2012', kind:'Book', domain:'Nonlocal', note:'First-person account of SRI remote viewing research.' },
  { title:'Margins of Reality', author:'Robert Jahn and Brenda Dunne', year:'1987', kind:'Book', domain:'Nonlocal', note:'PEAR Lab mind-matter interaction synthesis.' }
];

export const glossaryTerms = [
  { term:'Veridical perception', domain:'NDE', definition:'A reported perception during unconsciousness or clinical crisis that can be checked against external facts.' },
  { term:'Greyson NDE Scale', domain:'NDE', definition:'A 16-item instrument used to identify and measure the depth of near-death experiences.' },
  { term:'Life review', domain:'NDE', definition:'A panoramic re-experiencing of one’s life, often including the felt perspective of others affected by one’s actions.' },
  { term:'Terminal lucidity', domain:'Consciousness', definition:'Unexpected mental clarity shortly before death in someone with severe cognitive impairment.' },
  { term:'Hard problem', domain:'Consciousness', definition:'David Chalmers’ term for why physical processes are accompanied by subjective experience at all.' },
  { term:'Filter theory', domain:'Consciousness', definition:'The view that the brain limits or channels consciousness rather than producing it from scratch.' },
  { term:'Integrated Information Theory', domain:'Consciousness', definition:'A theory proposing consciousness corresponds to integrated causal structure within a system.' },
  { term:'Global Workspace Theory', domain:'Consciousness', definition:'A theory proposing conscious access occurs when information becomes globally available to cognitive systems.' },
  { term:'Orch OR', domain:'Quantum', definition:'Penrose and Hameroff’s theory that conscious moments involve orchestrated quantum state reductions in microtubules.' },
  { term:'Morphic resonance', domain:'Nonlocal', definition:'Rupert Sheldrake’s hypothesis that nature has field-like memory across similar forms and behaviors.' },
  { term:'Ganzfeld', domain:'Nonlocal', definition:'A sensory-reduction telepathy protocol used in parapsychology experiments.' },
  { term:'MEQ30', domain:'Psychedelics', definition:'The 30-item Mystical Experience Questionnaire used in psychedelic research.' },
  { term:'Ego dissolution', domain:'Psychedelics', definition:'A temporary weakening or loss of the ordinary sense of separate self.' },
  { term:'Cryptomnesia', domain:'Methodology', definition:'Remembering information without remembering its source, sometimes mistaken for paranormal knowledge.' }
];

export const timelineEvents = [
  { year:'1882', title:'Society for Psychical Research founded', text:'Early organized attempt to study survival, telepathy, apparitions, and mediumship with scholarly methods.' },
  { year:'1890', title:'William James publishes The Principles of Psychology', text:'James treats consciousness as a central scientific problem and later studies religious and anomalous experience.' },
  { year:'1966', title:'Stevenson publishes Twenty Cases', text:'Reincarnation research enters a more systematic field-investigation phase.' },
  { year:'1975', title:'Raymond Moody publishes Life After Life', text:'The term near-death experience enters public language.' },
  { year:'1983', title:'Greyson NDE Scale', text:'A standardized scale gives NDE research a shared measurement tool.' },
  { year:'1997', title:'Reincarnation and Biology', text:'Stevenson publishes extensive birthmark and birth-defect case documentation.' },
  { year:'2001', title:'van Lommel in The Lancet', text:'Prospective cardiac-arrest NDE study becomes a landmark clinical publication.' },
  { year:'2006', title:'Johns Hopkins psilocybin study', text:'Modern psychedelic research demonstrates reliable mystical-type experiences under controlled conditions.' },
  { year:'2014', title:'AWARE study published', text:'Parnia-led study reports awareness during cardiac arrest and tests hidden-target methodology.' },
  { year:'2020s', title:'Consciousness science diversifies', text:'IIT, GWT, recurrent processing, predictive processing, and nonlocal models compete for explanatory reach.' }
];
