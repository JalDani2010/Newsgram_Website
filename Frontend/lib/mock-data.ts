import type { Article, Comment } from "@/lib/types"

// Helper function to generate random view counts
const getRandomViewCount = () => Math.floor(Math.random() * 10000) + 500

// Helper function to generate random comments
const generateComments = (articleId: string, count: number = Math.floor(Math.random() * 5) + 1): Comment[] => {
  const comments: Comment[] = []

  for (let i = 0; i < count; i++) {
    const commentId = `comment-${articleId}-${i}`
    const hasReplies = Math.random() > 0.7

    comments.push({
      id: commentId,
      articleId,
      author: ["John Doe", "Jane Smith", "Alex Johnson", "Maria Garcia", "Sam Wilson"][Math.floor(Math.random() * 5)],
      authorAvatar: `/placeholder.svg?height=40&width=40&text=${i}`,
      content: [
        "This article was really insightful. Thanks for sharing!",
        "I disagree with some points here, but overall a good read.",
        "Interesting perspective. I'd like to see more coverage on this topic.",
        "Great reporting as always. Keep up the good work!",
        "I've been following this story for a while. This adds some new context I wasn't aware of.",
        "The implications of this are huge. I wonder what happens next.",
        "Thanks for covering this important topic. More people need to be aware of this.",
        "I shared this with my colleagues. Very relevant to our work.",
      ][Math.floor(Math.random() * 8)],
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
      likes: Math.floor(Math.random() * 50),
      replies: hasReplies ? generateComments(`${commentId}-reply`, Math.floor(Math.random() * 3) + 1) : undefined,
    })
  }

  return comments
}

// Add viewCount and comments to each article
export const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    title: "SpaceX Successfully Launches Starship for Orbital Test Flight",
    description:
      "SpaceX's Starship rocket completed its first successful orbital test flight, marking a major milestone for space exploration.",
    content: `SpaceX has successfully launched its Starship rocket for a full orbital test flight, marking a significant milestone in the company's ambitious space exploration program.

The massive rocket, standing at nearly 400 feet tall when fully stacked, lifted off from SpaceX's Starbase facility in South Texas. This successful test comes after several previous attempts that ended in spectacular explosions.

Starship is designed to be fully reusable and capable of carrying both crew and cargo to Earth orbit, the Moon, Mars, and beyond. It represents the next generation of spacecraft that could eventually enable human colonization of other planets.

During the test, the Super Heavy booster successfully separated from the Starship upper stage, which then continued on its journey to achieve orbital velocity. The booster was designed to return to Earth for a controlled landing, demonstrating SpaceX's commitment to reusability.

NASA has selected a version of Starship for its Artemis program, which aims to return humans to the lunar surface. This successful test brings that goal one step closer to reality.

SpaceX CEO Elon Musk has long emphasized that making life multiplanetary is essential for the long-term survival of humanity. Starship is central to that vision, designed to eventually carry up to 100 people on long-duration interplanetary flights.

Engineers will now analyze the vast amount of data collected during this test to make further improvements to the system. Additional test flights are planned in the coming months as SpaceX continues to refine the technology.`,
    author: "Jane Smith",
    source: "Space News",
    publishedAt: "2025-05-20T09:30:00Z",
    imageUrl: "/placeholder.svg?height=600&width=800",
    category: "science",
    url: "/article/1",
    viewCount: getRandomViewCount(),
    comments: generateComments("1", 8),
  },
  {
    id: "2",
    title: "New AI Model Can Predict Protein Structures with Unprecedented Accuracy",
    description:
      "Researchers have developed an AI system that can predict protein structures with near-experimental accuracy, potentially revolutionizing drug discovery.",
    content: `Scientists have developed a groundbreaking artificial intelligence system that can predict the three-dimensional structure of proteins with unprecedented accuracy, potentially revolutionizing drug discovery and our understanding of biological processes.

The new AI model, developed by a team of researchers from multiple universities, builds upon previous work in the field but achieves a level of accuracy that approaches experimental methods like X-ray crystallography and cryo-electron microscopy.

Proteins are the workhorses of cells, performing countless essential functions in living organisms. Understanding their structure is crucial because a protein's shape determines its function. However, determining protein structures experimentally is time-consuming and expensive.

This new AI system can accurately predict a protein's structure from just its amino acid sequence in a matter of minutes, rather than the months or years it might take using traditional laboratory methods.

"This breakthrough could accelerate research across virtually all areas of biology and medicine," said Dr. Sarah Chen, the lead researcher on the project. "From developing new medications to understanding disease mechanisms, this tool will be invaluable."

The system was trained on a massive dataset of known protein structures and uses a sophisticated deep learning architecture that captures the complex physical and chemical interactions that determine how proteins fold.

Pharmaceutical companies are already expressing interest in using the technology to speed up drug discovery processes. By accurately predicting how potential drug molecules might interact with target proteins, researchers can more efficiently identify promising candidates for further development.

The team has made their AI model available as an open-source tool, allowing scientists worldwide to benefit from this technological advancement.`,
    author: "Michael Johnson",
    source: "Science Today",
    publishedAt: "2025-05-19T14:45:00Z",
    imageUrl: "/placeholder.svg?height=600&width=800",
    category: "technology",
    url: "/article/2",
    viewCount: getRandomViewCount(),
    comments: generateComments("2", 5),
  },
  {
    id: "3",
    title: "Global Markets Rally as Inflation Shows Signs of Cooling",
    description:
      "Stock markets worldwide surged today as new economic data suggests inflation may be finally slowing down.",
    content: `Global stock markets rallied sharply today as newly released economic data indicated that inflation might be finally cooling down after months of persistent price increases that have worried investors and policymakers alike.

The S&P 500 jumped 2.3% in early trading, while European markets saw even stronger gains, with the pan-European STOXX 600 index rising 2.8%. Asian markets had already closed higher, with Japan's Nikkei gaining 1.9% and Hong Kong's Hang Seng up 2.4%.

The rally was triggered by consumer price index data that came in below economists' expectations, suggesting that the aggressive interest rate hikes implemented by central banks around the world may be starting to have their intended effect of taming inflation without tipping economies into recession.

"This is exactly what the market has been waiting for," said Maria Rodriguez, chief market strategist at Global Investments. "If inflation continues to moderate, central banks might be able to ease up on rate hikes sooner than expected, which would be a significant positive for equities."

Bond markets also reacted positively to the news, with yields on 10-year Treasury notes falling as investors adjusted their expectations for future interest rate increases. The dollar weakened against a basket of major currencies as traders recalibrated their positions.

Technology stocks, which have been particularly sensitive to higher interest rates, led the market gains. The tech-heavy Nasdaq Composite surged 3.1%, with semiconductor and software companies posting some of the largest advances.

Despite the optimism, some analysts cautioned that one month of better-than-expected inflation data doesn't necessarily signal the all-clear for the economy.

"We need to see a consistent trend of moderating inflation before we can confidently say the worst is behind us," warned James Wilson, economist at Capital Research. "There are still significant risks to the global economy, including ongoing supply chain disruptions and geopolitical tensions."

Central bank officials have also been careful not to declare victory prematurely. In recent communications, they have emphasized that they remain committed to bringing inflation back to target levels and will need to see substantial evidence of cooling prices before changing course.

Nevertheless, today's market reaction highlights how sensitive investors have become to inflation data and how eager they are for signs that the economic outlook is improving.`,
    author: "Robert Chen",
    source: "Financial Times",
    publishedAt: "2025-05-18T16:20:00Z",
    imageUrl: "/placeholder.svg?height=600&width=800",
    category: "business",
    url: "/article/3",
    viewCount: getRandomViewCount(),
    comments: generateComments("3", 6),
  },
  {
    id: "4",
    title: "Revolutionary Cancer Treatment Shows Promise in Clinical Trials",
    description:
      "A new immunotherapy approach has demonstrated remarkable results in treating previously untreatable forms of cancer.",
    content: `A groundbreaking cancer treatment that harnesses the body's own immune system has shown exceptional promise in early clinical trials, potentially offering hope to patients with forms of cancer that have traditionally been difficult to treat.

The novel immunotherapy approach, developed by researchers at the National Cancer Institute in collaboration with several major medical centers, works by reprogramming a patient's T cells—key components of the immune system—to recognize and attack cancer cells with unprecedented precision.

In the Phase 1 clinical trial involving 87 patients with advanced solid tumors who had exhausted all standard treatment options, 63% showed significant tumor shrinkage, with 28% experiencing complete remission—meaning no detectable cancer remained after treatment.

"These results are truly remarkable, especially considering these were patients who had no other treatment options left," said Dr. James Wilson, the lead investigator of the study. "We're seeing responses in cancer types that have historically been very resistant to immunotherapy."

What makes this approach different from existing immunotherapies is its ability to target multiple cancer markers simultaneously, making it harder for cancer cells to evade detection. The treatment also appears to create a "memory" in the immune system that continues to fight cancer cells long after the initial treatment.

Patients in the trial had various types of cancer, including pancreatic, ovarian, and certain aggressive forms of breast cancer—all known for their poor response to current immunotherapy approaches.

Side effects were generally manageable and included fever, fatigue, and temporary inflammation, though a small percentage of patients experienced more serious immune-related adverse events that required intervention.

Sarah Thompson, a 52-year-old participant in the trial who had stage 4 pancreatic cancer, described her experience: "After two years of treatments that didn't work, I had almost given up hope. But after receiving this new therapy, my scans showed no evidence of cancer after just three months. It feels like a miracle."

The research team is now planning a larger Phase 2 trial to further evaluate the treatment's efficacy and safety across a broader range of cancer types. They are also working on refining the manufacturing process to make the treatment more accessible if it receives regulatory approval.

While experts caution that larger studies are needed before the treatment could become widely available, many in the oncology community are cautiously optimistic about its potential.

"If these results hold up in larger trials, this could represent one of the most significant advances in cancer treatment in decades," said Dr. Lisa Chen, an oncologist not involved in the study. "It could potentially change how we approach many difficult-to-treat cancers."`,
    author: "Emily Williams",
    source: "Health Journal",
    publishedAt: "2025-05-17T11:15:00Z",
    imageUrl: "/placeholder.svg?height=600&width=800",
    category: "health",
    url: "/article/4",
    viewCount: getRandomViewCount(),
    comments: generateComments("4", 7),
  },
  {
    id: "5",
    title: "Tech Giant Unveils Revolutionary Augmented Reality Glasses",
    description:
      "A leading technology company has revealed its next-generation AR glasses that could replace smartphones within five years.",
    content: `A major technology company unveiled its highly anticipated augmented reality glasses yesterday, showcasing what many industry experts believe could be the beginning of the end for smartphones as we know them.

The sleek, lightweight glasses—which resemble ordinary eyewear but contain sophisticated computing technology—project high-resolution digital information directly into the wearer's field of vision, seamlessly blending virtual elements with the real world.

Unlike previous attempts at AR glasses that were bulky, had limited functionality, or poor battery life, these new glasses address all these limitations with breakthrough advances in miniaturization, display technology, and power efficiency.

"This isn't just an accessory for your smartphone—it's designed to eventually replace it entirely," said the company's CEO during the product announcement. "We believe this represents the next major computing platform."

The glasses feature voice control, gesture recognition, and a novel neural interface that can detect subtle eye movements for navigation. They connect to the internet via 5G or Wi-Fi and can pair with smartphones during the transition period.

Use cases demonstrated during the event included real-time translation of foreign language text, navigation with directions appearing to be painted on the street ahead, and collaborative work environments where multiple users could see and interact with the same virtual objects.

Perhaps most impressively, the glasses can create persistent digital objects that appear to exist in physical space—virtual screens that stay put in your home or office, digital artwork on your walls, or information panels that appear above physical objects when you look at them.

"The potential applications are virtually limitless," said Dr. Maya Patel, an AR researcher not affiliated with the company. "From education and healthcare to entertainment and productivity, this technology could transform how we interact with digital information and with each other."

Privacy advocates have raised concerns about the cameras and sensors built into the glasses, though the company insists it has implemented strong privacy protections, including visual indicators when recording is active and strict limitations on data collection.

The glasses will be available to developers next month and to consumers early next year at a price point of $999—expensive, but comparable to premium smartphones. The company expects prices to decrease significantly as manufacturing scales up.

Industry analysts predict that if the product delivers on its promises, it could trigger a major shift in the tech industry, with other major players accelerating their own AR initiatives in response.

"This could be as significant as the introduction of the iPhone," said tech analyst Marcus Johnson. "We're potentially witnessing the birth of the platform that will eventually make smartphones obsolete."`,
    author: "David Lee",
    source: "Tech Insider",
    publishedAt: "2025-05-16T13:40:00Z",
    imageUrl: "/placeholder.svg?height=600&width=800",
    category: "technology",
    url: "/article/5",
    viewCount: getRandomViewCount(),
    comments: generateComments("5", 4),
  },
  {
    id: "6",
    title: "Historic Climate Agreement Reached as Nations Commit to Aggressive Emission Cuts",
    description:
      "In a landmark decision, 195 countries have agreed to significantly accelerate carbon emission reductions to combat climate change.",
    content: `In what many are calling a watershed moment for global climate action, representatives from 195 countries have reached a historic agreement to dramatically accelerate carbon emission reductions over the next decade, setting the world on a path that could limit global warming to 1.5 degrees Celsius above pre-industrial levels.

The agreement, finalized after two weeks of intense negotiations at the annual UN Climate Change Conference, commits nations to cutting carbon emissions by 60% by 2035 compared to 2010 levels—a far more ambitious target than previous international climate accords.

"This is the breakthrough we've been waiting for," said UN Secretary-General Maria Rodriguez. "For the first time, we have commitments that actually match the scale of the crisis we face."

The agreement includes several groundbreaking provisions:

- A legally binding framework that requires countries to update their climate plans every two years rather than every five years
- A $100 billion annual climate finance fund for developing nations, with contributions based on historical emissions
- A global carbon pricing mechanism to be phased in starting in 2027
- A commitment to end deforestation by 2030
- A pledge to phase out coal power in developed nations by 2030 and globally by 2040

Perhaps most significantly, the agreement includes robust monitoring and enforcement mechanisms that were absent from previous climate deals, including financial penalties for nations that fail to meet their targets.

The breakthrough came after several major economies, including the United States and China, announced new domestic climate legislation that made more ambitious international commitments possible. Rising public pressure following a series of devastating climate disasters also played a crucial role in pushing negotiators toward consensus.

"We've moved beyond pledges and promises to concrete action," said Emma Chen, climate minister for a Pacific island nation. "For vulnerable countries like mine, this agreement isn't just about policy—it's about survival."

Business leaders have generally welcomed the agreement, with many major corporations having already set their own net-zero targets. "This provides the long-term regulatory certainty that businesses need to invest in clean energy and sustainable practices," said the CEO of a multinational energy company.

However, some environmental groups argue that even these strengthened commitments may not be enough to prevent dangerous levels of warming. "This is a major step forward, but the science tells us we need to move even faster," said the director of a prominent climate advocacy organization.

Implementation will be the next challenge, as countries must now translate these international commitments into domestic policy and investment decisions. A new international climate authority will be established to monitor progress and provide technical assistance to nations struggling to meet their targets.

Despite the challenges ahead, the agreement represents a remarkable diplomatic achievement and a potential turning point in humanity's response to climate change. "Future generations may look back on this day as the moment when we finally began to take this crisis seriously," said a senior climate negotiator.`,
    author: "Sophia Rodriguez",
    source: "Environmental Report",
    publishedAt: "2025-05-15T10:00:00Z",
    imageUrl: "/placeholder.svg?height=600&width=800",
    category: "world",
    url: "/article/6",
    viewCount: getRandomViewCount(),
    comments: generateComments("6", 3),
  },
  {
    id: "7",
    title: "Major League Expands with Two New Franchise Teams",
    description:
      "The professional sports landscape is changing as a major league announces expansion to two new cities.",
    content: `In a move that will reshape the professional sports landscape, one of North America's major sports leagues announced yesterday that it will add two new franchise teams, expanding to previously untapped markets and growing to 32 teams overall.

The expansion, which will take effect in the 2027 season, follows years of speculation and an extensive evaluation process that considered factors including market size, fan base potential, ownership groups, and stadium plans.

The two cities selected—Austin, Texas and Portland, Oregon—represent rapidly growing metropolitan areas that have demonstrated strong support for professional sports through attendance at minor league games and viewership data.

"This is an exciting day for our league and for sports fans in these fantastic cities," said the league commissioner at a press conference announcing the decision. "Both markets have shown tremendous enthusiasm and commitment to bringing professional teams to their communities."

Each expansion franchise will pay an entry fee of $2.5 billion, reflecting the soaring valuations of professional sports teams in recent years. The funds will be distributed among the existing 30 franchise owners.

In Austin, a new state-of-the-art stadium will be constructed downtown as part of a larger entertainment district, with groundbreaking scheduled for early next year. The ownership group is led by a consortium of technology executives from companies based in the city.

Portland will renovate and expand an existing facility to accommodate the new team, with significant private and public investment. The ownership group there includes a mix of local business leaders and a prominent former player who grew up in the region.

"We've been working toward this moment for over a decade," said Maria Johnson, who heads the Portland ownership group. "This city has some of the most passionate sports fans in the country, and they deserve a team at the highest level."

The league will hold an expansion draft in 2026, allowing the new franchises to select players from existing teams under specific rules designed to help them build competitive rosters while protecting the core of current teams.

Sports economists project that each new team could generate hundreds of millions in economic activity for their respective cities, though some academic studies have questioned the extent of such benefits.

Fan reaction in both cities has been enthusiastic, with season ticket deposits already exceeding expectations. Meanwhile, supporters in several cities that were not selected have expressed disappointment, with ownership groups in Montreal and San Diego vowing to continue pursuing professional franchises in future expansion rounds.

The league's broadcast partners have welcomed the expansion, which will provide additional content and access to two growing media markets. The next television rights deal, expected to be negotiated in 2026, will likely reflect the increased value of a larger league footprint.

"This expansion represents not just growth in the number of teams, but in the overall reach and cultural relevance of our sport," the commissioner added. "We're building for the next generation of fans."`,
    author: "Marcus Johnson",
    source: "Sports Network",
    publishedAt: "2025-05-14T18:30:00Z",
    imageUrl: "/placeholder.svg?height=600&width=800",
    category: "sports",
    url: "/article/7",
    viewCount: getRandomViewCount(),
    comments: generateComments("7", 2),
  },
  {
    id: "8",
    title: "Renowned Filmmaker Announces Groundbreaking Virtual Reality Movie Experience",
    description:
      "An acclaimed director is pushing the boundaries of cinema with an innovative VR film that allows viewers to experience the story from multiple perspectives.",
    content: `An acclaimed filmmaker has announced plans for what could be a revolutionary advancement in cinema: a feature-length virtual reality movie that will allow viewers to experience the narrative from multiple perspectives and even influence the story's direction.

The project, titled "Perspectives," comes from a director known for pushing technological and storytelling boundaries. It will be the first VR film from a major filmmaker designed as a complete cinematic experience rather than a short demonstration or supplement to a traditional film.

"Cinema has always been about transporting audiences to different worlds, but the medium has fundamental limitations," the director explained during a technology conference where the project was unveiled. "With VR, we can break the frame entirely and create something that's neither traditional film nor video game, but a new art form altogether."

Unlike conventional movies where the camera dictates what viewers see, "Perspectives" will place audiences inside a 360-degree environment where they can look anywhere and follow different characters through an interconnected narrative. The story—a mystery set in a near-future city—unfolds simultaneously from the viewpoints of seven different characters whose lives intersect in unexpected ways.

The production is employing cutting-edge volumetric capture technology that records actors from all angles, allowing viewers to move around within scenes rather than being fixed to a single position. This approach differs from computer-generated VR experiences, aiming instead for the emotional impact of performances by real actors.

"We're not just filming a movie in 360 degrees," said the project's cinematographer. "We're rethinking every aspect of production—lighting, sound design, editing, performance—for a medium where the audience has agency."

The film will be viewable on major VR headsets, with a simplified version available for smartphones and a traditional "director's cut" for conventional screens. This multi-platform approach aims to make the groundbreaking project accessible to audiences regardless of their access to VR technology.

Several A-list actors have signed on to the project, intrigued by the challenge of performing for a medium where viewers might be looking anywhere at any time. "It's like combining film acting with theater," said one cast member. "You have to be present and authentic throughout the entire scene because you never know where the viewer's attention will be."

Film critics and industry analysts have expressed both excitement and skepticism about the project. Some see it as the future of storytelling, while others question whether audiences want this level of involvement in their entertainment experiences.

"The history of cinema is full of technological innovations that were initially dismissed as gimmicks but later became essential tools for storytellers," noted a film historian. "Whether this particular project succeeds or not, it represents an important experiment in the evolution of visual storytelling."

Production is scheduled to begin next month, with a targeted release in late 2026. The filmmaker has secured backing from both traditional film studios and technology companies interested in pushing the boundaries of what's possible in immersive entertainment.`,
    author: "Olivia Taylor",
    source: "Entertainment Weekly",
    publishedAt: "2025-05-13T15:10:00Z",
    imageUrl: "/placeholder.svg?height=600&width=800",
    category: "entertainment",
    url: "/article/8",
    viewCount: getRandomViewCount(),
    comments: generateComments("8", 5),
  },
  {
    id: "9",
    title: "Researchers Discover Potential Breakthrough in Alzheimer's Treatment",
    description:
      "Scientists have identified a compound that appears to reverse memory loss in early animal trials, offering new hope for Alzheimer's patients.",
    content: `Scientists at the National Institute of Neurological Research have identified a compound that appears to reverse memory loss and cognitive decline in animal models of Alzheimer's disease, potentially representing one of the most significant breakthroughs in decades for a condition that affects millions worldwide.

The compound, currently known as NB-52, targets the formation of tau tangles—one of the hallmark features of Alzheimer's disease—and appears to not only prevent new tangles from forming but also to dissolve existing ones, allowing neurons to reestablish connections.

"What makes this particularly exciting is that we're seeing functional recovery, not just a slowing of decline," said Dr. Elena Martinez, the lead researcher on the study. "The animals treated with NB-52 showed dramatic improvements in memory tests, returning almost to the level of healthy control subjects."

In the study, mice genetically engineered to develop Alzheimer's-like symptoms were treated with the compound for 12 weeks. Those receiving NB-52 showed a 78% reduction in tau tangles and performed significantly better on maze navigation and object recognition tests compared to untreated mice.

Perhaps most remarkably, the treatment appeared effective even after significant cognitive decline had already occurred, suggesting it might help patients who have already begun experiencing symptoms—a goal that has eluded researchers for decades.

"Most previous approaches have focused on preventing the disease rather than treating it once it's established," explained Dr. James Wilson, a neurologist not involved in the research. "If these results translate to humans, it could change our entire approach to Alzheimer's treatment."

The compound works through a novel mechanism, activating the brain's natural waste-clearing systems while also stabilizing microtubules—the cellular structures that maintain neuronal shape and function. This dual action appears to create an environment where damaged neurons can recover and resume normal function.

Safety studies in multiple animal species have shown no significant toxicity or side effects at therapeutic doses, though researchers caution that human trials will be needed to confirm both safety and efficacy in people.

The research team is already preparing for Phase 1 clinical trials, which could begin as early as next year. While the path from successful animal studies to approved human treatments is notoriously difficult—particularly for neurological conditions—the robust results have generated cautious optimism among Alzheimer's researchers and patient advocacy groups.

"We've seen promising results in animal models before that didn't translate to humans," said the director of a national Alzheimer's association. "But the comprehensive nature of these findings, particularly the functional recovery aspect, gives us reason for hope."

If successful in human trials, NB-52 or similar compounds could potentially help the more than 55 million people worldwide currently living with Alzheimer's and related dementias—a number expected to nearly triple by 2050 as populations age.

The research, published today in the journal Neuroscience, represents a collaboration between academic researchers and a biotechnology company that has licensed the compound for development.`,
    author: "Thomas Anderson",
    source: "Medical Journal",
    publishedAt: "2025-05-12T09:20:00Z",
    imageUrl: "/placeholder.svg?height=600&width=800",
    category: "health",
    url: "/article/9",
    viewCount: getRandomViewCount(),
    comments: generateComments("9", 6),
  },
  {
    id: "10",
    title: "Senate Passes Comprehensive Infrastructure Bill with Bipartisan Support",
    description:
      "After months of negotiations, lawmakers have approved a $1.2 trillion package to rebuild roads, bridges, and expand broadband access.",
    content: `In a rare display of bipartisanship, the Senate yesterday passed a comprehensive $1.2 trillion infrastructure bill aimed at rebuilding America's aging roads and bridges, expanding broadband internet access, and upgrading the nation's power grid and water systems.

The legislation, which passed by a vote of 69-31 with support from both parties, represents one of the largest federal investments in infrastructure in decades and delivers on a key priority for the administration.

"This bill proves that we can work across the aisle to deliver real results for the American people," said the Senate Majority Leader after the vote. "These investments will create good-paying jobs, make our economy more competitive, and prepare our country for the challenges of the 21st century."

The package includes:

- $110 billion for roads, bridges, and major infrastructure projects
- $66 billion for passenger and freight rail upgrades
- $65 billion to expand broadband internet access, particularly in rural areas
- $55 billion for water infrastructure, including replacing lead pipes
- $73 billion to modernize the electrical grid and support clean energy transmission
- $42 billion for ports, airports, and related infrastructure
- $39 billion for public transit systems
- $7.5 billion to build a nationwide network of electric vehicle charging stations

The legislation also includes provisions to ensure that infrastructure projects prioritize climate resilience and that federal funds are spent efficiently with proper oversight.

The bill's passage follows months of intense negotiations between a bipartisan group of senators and the White House, with several near-collapses of the talks before a final agreement was reached. The compromise package is smaller than the administration's initial $2.3 trillion proposal but still represents a historic level of investment.

"This isn't a perfect bill—no compromise ever is—but it makes the largest investment in infrastructure in my lifetime," said a Republican senator who supported the legislation. "These are investments that will benefit every state and every American."

The bill now moves to the House of Representatives, where its path forward is complicated by progressive Democrats who have tied its passage to a separate, larger spending package focused on climate change, healthcare, and education. House leadership has indicated they hope to vote on both measures in the coming weeks.

Business groups, labor unions, and civil engineers have all expressed support for the infrastructure package, citing the critical need to modernize the nation's aging systems and the economic benefits of the investments.

The American Society of Civil Engineers, which regularly issues report cards on the state of U.S. infrastructure, called the bill "a significant down payment on addressing our infrastructure deficit," noting that it would help improve the nation's overall infrastructure grade, which currently stands at C-.

Economic analysts project that the investments could create hundreds of thousands of jobs over the next decade while boosting productivity and economic growth. The White House has emphasized that many of these jobs would be accessible to workers without college degrees.

If signed into law, the legislation would represent a significant legislative achievement for the administration and a rare moment of functional governance in an otherwise deeply divided Washington.`,
    author: "Jennifer Parker",
    source: "Political Review",
    publishedAt: "2025-05-11T14:50:00Z",
    imageUrl: "/placeholder.svg?height=600&width=800",
    category: "politics",
    url: "/article/10",
    viewCount: getRandomViewCount(),
    comments: generateComments("10", 8),
  },
  {
    id: "11",
    title: "Quantum Computing Milestone: Researchers Achieve Error Correction Breakthrough",
    description:
      "Scientists have demonstrated a practical quantum error correction system, bringing fault-tolerant quantum computers closer to reality.",
    content: `In a development that could accelerate the timeline for practical quantum computing, researchers at the Quantum Information Science Center have demonstrated the first complete quantum error correction system that can detect and fix errors without introducing more problems than it solves.

Quantum error correction has long been considered the holy grail for quantum computing, as quantum bits (qubits) are extremely fragile and prone to errors due to environmental noise, a problem known as decoherence. Until now, attempts to correct these errors typically introduced more errors than they fixed, creating a seemingly insurmountable barrier to scaling quantum computers to useful sizes.

The breakthrough, published today in the journal Science, uses a novel approach called "topological surface code" that spreads quantum information across multiple physical qubits to create more robust logical qubits. The team demonstrated that their system could maintain quantum information with an error rate below 0.1%, the threshold theoretically required for fault-tolerant quantum computation.

"This is the quantum computing equivalent of breaking the sound barrier," said Dr. Sarah Chen, lead author of the study. "We've known theoretically that quantum error correction should be possible, but actually demonstrating it in a practical system is a watershed moment for the field."

The research team used a 49-qubit superconducting quantum processor to implement their error correction scheme, showing that they could protect quantum information for up to 10 milliseconds—an eternity in quantum computing terms and long enough to perform thousands of quantum operations.

What makes this achievement particularly significant is that the error correction overhead—the extra qubits needed to protect information—was manageable enough to be practical in near-term systems. Previous theoretical approaches required hundreds of physical qubits to create a single error-protected logical qubit, making them impractical with current technology.

"We've reduced the overhead to about 15 physical qubits per logical qubit, which means we could build useful error-corrected quantum computers with a few thousand qubits rather than millions," explained Dr. Michael Johnson, a co-author of the study.

Industry experts not involved in the research have described the result as a potential inflection point for quantum computing. "This could compress the timeline for practical quantum advantage by years," said the director of quantum research at a major technology company. "It addresses what many considered the most fundamental roadblock to useful quantum computers."

The implications extend across numerous fields. Quantum computers promise exponential speedups for certain problems in cryptography, materials science, drug discovery, and optimization that are intractable for classical computers. Error correction is essential for quantum computers to scale to the sizes needed to tackle these problems.

The research team is now working to implement their error correction scheme on larger quantum processors and to demonstrate quantum algorithms running on error-corrected logical qubits. They estimate that the first fault-tolerant quantum computers capable of solving useful problems could be available within five years, significantly earlier than previous projections.

Several quantum computing companies have already announced plans to incorporate the new error correction techniques into their development roadmaps, signaling a shift in industry focus from increasing raw qubit counts to improving qubit quality and implementing error correction.

"We're moving from the ENIAC era of quantum computing to something more like the early microprocessor era," said Dr. Chen, referring to the evolution of classical computers. "There's still much work to be done, but the fundamental barrier to practical quantum computing appears to have been overcome."`,
    author: "Daniel Kim",
    source: "Quantum Science Today",
    publishedAt: "2025-05-10T11:25:00Z",
    imageUrl: "/placeholder.svg?height=600&width=800",
    category: "technology",
    url: "/article/11",
    viewCount: getRandomViewCount(),
    comments: generateComments("11", 5),
  },
  {
    id: "12",
    title: "Archaeologists Uncover Ancient City That Rewrites History of Early Civilization",
    description:
      "A massive urban center discovered in the Amazon rainforest suggests advanced societies existed there 2,000 years earlier than previously thought.",
    content: `Archaeologists working in the Amazon rainforest have uncovered the remains of a vast urban center that could fundamentally alter our understanding of pre-Columbian civilization in South America, suggesting that advanced, complex societies existed in the region at least 2,000 years earlier than previously believed.

The discovery, made using a combination of lidar technology and traditional excavation, reveals a sprawling city covering approximately 30 square kilometers that was home to an estimated 40,000 people at its peak around 1500 BCE. The site includes monumental architecture, sophisticated water management systems, and evidence of advanced agricultural practices.

"This completely changes our timeline for urban development in the Amazon," said Dr. Isabella Ramirez, the lead archaeologist on the project. "We're looking at a society with complex engineering, social stratification, and regional influence that existed when conventional wisdom said this region could only support small, nomadic groups."

The ancient city, located in what is now eastern Bolivia, features a central ceremonial complex with pyramids arranged to track astronomical events, surrounded by residential neighborhoods connected by a network of raised roads that remained usable even during seasonal flooding. Particularly impressive is an intricate system of canals, reservoirs, and dams that controlled water flow throughout the urban area.

"The hydraulic engineering we're seeing here rivals anything from the ancient world," noted Dr. James Wilson, a specialist in pre-Columbian water management systems. "They transformed what could have been a challenging environment into a productive, sustainable urban landscape."

Analysis of plant remains indicates the civilization cultivated a diverse range of crops, including varieties of maize, sweet potatoes, and other plants that had been domesticated and adapted to the local environment. This agricultural system appears to have supported a dense population without causing the environmental degradation often associated with intensive farming.

The discovery challenges long-held assumptions about the Amazon as a "pristine wilderness" barely touched by human hands before European contact. Instead, it suggests that humans have been actively shaping and managing the Amazon landscape for millennia, with implications for modern conservation and sustainable development practices.

"What we're seeing is not humans destroying nature, but humans working with ecological processes to create a productive landscape that enhanced biodiversity while supporting a large population," explained Dr. Maria Santos, an archaeobotanist working at the site.

Artifacts recovered from the site include elaborate ceramics, stone tools, and objects made from materials sourced from hundreds of kilometers away, indicating extensive trade networks. The team has also identified what appears to be a written communication system—a series of symbols carved into ceramics and stone that could represent one of the earliest writing systems in the Americas.

Carbon dating of organic materials from the lowest excavated layers suggests the settlement began around 2000 BCE, with the most intensive period of construction and expansion occurring between 1500 BCE and 500 BCE—a time when many archaeologists previously believed the Amazon could only support small-scale societies.

The research team, which includes scientists from universities in Bolivia, Brazil, the United States, and Europe, plans to continue excavations at the site for several more years. They are also using remote sensing technology to identify other potential urban centers in the region that may have been part of a larger network of Amazonian civilizations.

"We're just beginning to understand the scale and sophistication of these early Amazonian societies," said Dr. Ramirez. "This discovery should prompt us to reconsider many of our assumptions about human history in the Americas and the relationship between humans and their environment."`,
    author: "Carlos Mendez",
    source: "Archaeological Review",
    publishedAt: "2025-05-09T08:45:00Z",
    imageUrl: "/placeholder.svg?height=600&width=800",
    category: "science",
    url: "/article/12",
    viewCount: getRandomViewCount(),
    comments: generateComments("12", 7),
  },
  {
    id: "13",
    title: "Renewable Energy Surpasses Fossil Fuels in Global Electricity Production for First Time",
    description:
      "A new report shows that wind, solar, and other clean energy sources now generate more of the world's electricity than coal, natural gas, and oil combined.",
    content: `In a historic milestone for global efforts to combat climate change, renewable energy sources have surpassed fossil fuels in worldwide electricity production for the first time, according to a comprehensive report released yesterday by the International Energy Agency (IEA).

The report, which analyzes global energy data from 2024, shows that wind, solar, hydroelectric, geothermal, and other renewable sources now account for 51.3% of global electricity generation, compared to 48.7% for coal, natural gas, and oil combined. This represents a dramatic shift from just a decade ago, when renewables provided only 27% of global electricity.

"This is a watershed moment in the global energy transition," said the IEA's executive director. "The crossover point from fossil fuels to renewables for electricity has arrived earlier than most predictions, driven by rapidly falling costs for clean energy technologies and strong policy support in key regions."

Solar power has seen the most dramatic growth, with global capacity increasing by 39% in the past year alone. Wind power capacity grew by 17%, while battery storage capacity—critical for managing the intermittency of some renewable sources—more than doubled.

China remains the world's largest producer and consumer of renewable energy, generating more solar and wind power than the next three countries combined. However, the report notes that renewable growth is now broadly distributed, with significant capacity additions across Europe, North America, India, and increasingly in Africa and Southeast Asia.

The economic factors driving this transition have become increasingly compelling. The report highlights that in nearly all major markets, new solar and wind installations now produce electricity at a lower cost than new fossil fuel plants—and in many regions, they're cheaper than continuing to operate existing coal and gas facilities.

"What we're seeing is not just an environmental choice but an economic one," explained energy economist Dr. Sarah Chen. "The business case for renewables has become irresistible in most markets, with or without subsidies."

Employment in the renewable sector has also surged, with the report estimating that clean energy industries now employ over 32 million people worldwide—more than the oil and gas industry at its peak.

Despite this milestone, the report cautions that significant challenges remain in fully decarbonizing the global energy system. While renewables now dominate electricity production, electricity represents only about 20% of total final energy consumption. Transportation, industry, and building heating still rely heavily on fossil fuels in many regions.

The report also highlights the need for massive investments in electricity grids and storage to accommodate higher shares of variable renewable energy. Global investment in grid infrastructure needs to triple by 2030 to keep pace with renewable deployment, according to the IEA's analysis.

Policy support remains crucial as well. The countries making the fastest progress have implemented comprehensive policy frameworks that include carbon pricing, renewable portfolio standards, building codes that favor electrification, and support for research and development.

Environmental groups have welcomed the milestone but emphasize that the pace of change must accelerate further to meet climate goals. "This is a moment to celebrate, but also to redouble our efforts," said the director of a major climate advocacy organization. "We need to replicate this success in other sectors and continue to accelerate the electricity transition."

The report projects that if current growth rates continue, renewables could provide 75% of global electricity by 2030 and approach 100% in many advanced economies—a transformation that would have seemed impossible just a few years ago.`,
    author: "Lisa Johnson",
    source: "Energy Monitor",
    publishedAt: "2025-05-08T12:15:00Z",
    imageUrl: "/placeholder.svg?height=600&width=800",
    category: "science",
    url: "/article/13",
    viewCount: getRandomViewCount(),
    comments: generateComments("13", 4),
  },
  {
    id: "14",
    title: "International Space Station to be Replaced by Commercial Space Habitats by 2030",
    description:
      "NASA and international partners have selected three companies to develop private space stations as the ISS approaches retirement.",
    content: `NASA and its international partners have announced plans to transition from the International Space Station (ISS) to a new generation of commercially operated space habitats by the end of this decade, marking a fundamental shift in how humanity maintains a permanent presence in low Earth orbit.

The space agency has selected three companies—Orbital Dynamics, Axiom Space, and Blue Origin—to develop and operate private space stations that will eventually replace the ISS, which is scheduled for retirement and controlled deorbit in 2030 after more than three decades of continuous human presence in space.

"This represents the next evolution in our approach to space exploration," said NASA's administrator during the announcement. "Just as we've transitioned to commercial cargo and crew services, we're now enabling private industry to take the lead in providing the orbital platforms where humans will live, work, and conduct research in space."

The three selected companies will receive a combined $3.5 billion in NASA funding to develop their space station concepts, with the expectation that they will also secure significant private investment. The agency will then become an anchor customer for these facilities, purchasing services rather than owning and operating the infrastructure directly.

Orbital Dynamics is developing "Elysium Station," a modular facility that can accommodate up to 12 astronauts and features dedicated research laboratories, manufacturing facilities, and even a small centrifuge section that provides artificial gravity for long-duration stays. The company plans to launch the first modules in 2027.

Axiom Space, which already has a module attached to the ISS as a precursor to its own station, will expand its design to create "Axiom Station," focusing on both scientific research and space tourism. Their facility will include luxury accommodations for private astronauts alongside research facilities for government and commercial users.

Blue Origin's "Orbital Reef," developed in partnership with Sierra Space, takes a different approach with a more open architecture designed to support a diverse ecosystem of users and applications, from research and manufacturing to entertainment and even on-orbit filming capabilities.

All three stations will be positioned in low Earth orbit, similar to the ISS, and will be designed with sustainability and expandability in mind. Unlike the ISS, which required regular resupply missions and maintenance, the new stations will incorporate more automated systems and use standardized interfaces to allow for easier upgrades and module replacements.

The transition plan includes a period of overlap where both the ISS and at least one commercial station will be operational simultaneously, ensuring continuity of human presence in orbit and allowing for the gradual transfer of research activities and operational experience.

For the international partners who have been integral to the ISS program—including the European Space Agency, Japan's JAXA, and Canada's CSA—the shift presents both challenges and opportunities. These agencies will need to negotiate their own agreements with the commercial operators, but will also gain more flexibility in how they participate in low Earth orbit activities.

Russia, which has been a key ISS partner despite geopolitical tensions, has announced plans to develop its own national space station rather than joining the commercial station initiative.

The commercialization of low Earth orbit is expected to significantly reduce costs while expanding access to space. "When you have multiple providers competing and innovating, you drive down costs and increase capabilities," explained an aerospace analyst. "We could see the price of sending a researcher to orbit drop by an order of magnitude in the next decade."

Beyond scientific research, the commercial stations are expected to enable new industries in space, from manufacturing unique materials in microgravity to supporting space tourism and potentially serving as waypoints for missions to the Moon and Mars.

As the ISS enters its final years of operation, NASA and its partners will focus on completing key research objectives while preparing for the transition. The agency has emphasized that the decommissioning of the ISS will be conducted safely, with most components designed to burn up during controlled reentry over unpopulated areas of the Pacific Ocean.`,
    author: "Michael Chen",
    source: "Space News",
    publishedAt: "2025-05-07T16:40:00Z",
    imageUrl: "/placeholder.svg?height=600&width=800",
    category: "science",
    url: "/article/14",
    viewCount: getRandomViewCount(),
    comments: generateComments("14", 6),
  },
  {
    id: "15",
    title: "Global Streaming Service Acquires Major Film Studio in Industry-Shaking Deal",
    description:
      "In a move that further consolidates the entertainment industry, a leading streaming platform has purchased one of Hollywood's oldest studios.",
    content: `In a seismic shift for the entertainment industry, global streaming giant StreamFlix has acquired Century Pictures, one of Hollywood's oldest and most prestigious film studios, in a deal valued at $38.5 billion. The acquisition, announced yesterday after months of speculation, represents one of the largest media mergers in history and signals a dramatic acceleration in the ongoing transformation of how entertainment is produced and distributed.

The deal gives StreamFlix ownership of Century's vast library of over 4,000 films and 10,000 television episodes, including several major franchise properties, as well as the studio's production facilities, distribution networks, and theme park interests. It also eliminates one of the few remaining independent major studios as the industry continues to consolidate around a handful of integrated content and distribution companies.

"This combination creates a truly global entertainment powerhouse," said StreamFlix's CEO in a statement. "By bringing together Century's unparalleled storytelling legacy and creative talent with our technology platform and direct relationship with hundreds of millions of subscribers, we're positioned to define the future of entertainment."

Century Pictures, founded in 1924, has been responsible for some of cinema's most iconic films and has won more Academy Awards than any other studio. Despite this storied history, the company has struggled in recent years to adapt to the streaming-dominated landscape, with theatrical attendance declining and production costs rising.

"The economics of the traditional studio model have become increasingly challenging," explained media analyst Sarah Johnson. "Without a direct-to-consumer platform of their own, studios like Century were facing an existential threat as the theatrical window continued to shrink and streaming services gained more leverage in licensing negotiations."

The acquisition has already raised concerns among filmmakers, theater owners, and regulators. Several prominent directors have expressed worry that the deal could further diminish theatrical exhibition, with StreamFlix known for giving only limited theatrical releases to most of its original films.

"This is another nail in the coffin for the cinematic experience," said an Oscar-winning director who has worked extensively with Century. "When decisions about what films get made are driven primarily by algorithms and subscription metrics rather than creative vision, we all lose something valuable."

The National Association of Theater Owners issued a statement calling for regulatory scrutiny of the deal, arguing that it would further reduce competition and potentially limit consumer choice. "When the same company controls both production and distribution at this scale, there are legitimate concerns about market power and the future viability of independent theaters," the statement read.

Regulatory approval remains the final hurdle for the acquisition, with antitrust reviews expected in the United States, European Union, and several other jurisdictions. Legal experts suggest the deal will likely face significant scrutiny but may ultimately be approved with certain conditions, potentially including requirements to license content to competing platforms or divest certain assets.

For StreamFlix, which began as a DVD-by-mail service before pioneering the subscription streaming model, the acquisition represents the culmination of a long-term strategy to become a vertically integrated entertainment company. The company has been investing heavily in original content production for years but has faced increasing competition from rival streaming services launched by traditional media companies.

Industry observers note that the deal could trigger further consolidation, as remaining independent studios may feel pressure to seek their own merger partners to remain competitive. It also raises questions about the future of creativity in an increasingly consolidated industry dominated by a few global platforms.

"The history of media consolidation suggests that fewer, larger companies typically means less risk-taking and less diversity in storytelling," noted a professor of media studies at a leading university. "The question is whether the efficiencies and resources of these larger entities can offset those concerns by enabling certain types of ambitious projects that might not otherwise get made."

For consumers, the immediate impact will likely include the migration of Century's content library to the StreamFlix platform, though existing licensing deals with other services will remain in effect until they expire. The company has indicated that it plans to continue producing films for theatrical release, particularly for franchise properties and potential awards contenders, while leveraging Century's expertise to enhance its original content production.`,
    author: "Rebecca Torres",
    source: "Entertainment Daily",
    publishedAt: "2025-05-06T13:30:00Z",
    imageUrl: "/placeholder.svg?height=600&width=800",
    category: "entertainment",
    url: "/article/15",
    viewCount: getRandomViewCount(),
    comments: generateComments("15", 3),
  },
  {
    id: "16",
    title: "Underdog Team Completes Miraculous Championship Run",
    description:
      "Against all odds, a team that began the season with 100-to-1 odds has won their league's championship in stunning fashion.",
    content: `In what sports historians are already calling one of the greatest underdog stories in modern athletics, the Metro City Mavericks completed their improbable championship run last night with a dramatic overtime victory against the heavily favored Coastal Titans, capping a season that began with 100-to-1 odds against them winning the title.

The Mavericks, who had never advanced beyond the quarterfinals in their 15-year history and were widely predicted to finish near the bottom of the standings this season, defeated the defending champion Titans 104-101 in a game that featured seven lead changes in the final five minutes of regulation before being decided in the closing seconds of overtime.

"I still can't believe this is real," said Mavericks captain Marcus Johnson, who scored 32 points including the game-winning three-pointer with 2.3 seconds remaining in overtime. "From day one, nobody believed in us except the people in our locker room. We just kept fighting, kept believing, and somehow we're standing here with the trophy."

The championship represents a remarkable turnaround for a franchise that finished with the second-worst record in the league just two seasons ago and entered this year with the lowest payroll in the league—less than one-third of what the Titans spend on player salaries.

First-year head coach Sarah Williams, who at 34 becomes the youngest coach ever to win the championship, implemented an innovative system that emphasized speed, three-point shooting, and unconventional defensive schemes to overcome the team's lack of size and star power.

"We knew we couldn't beat teams like the Titans playing conventional basketball," explained Williams after the game. "We had to change the math of the game, take risks, and create a style that maximized our specific talents. The players bought in from day one, even when we started the season 3-9."

The Mavericks' playoff run was equally improbable. They entered as the lowest seed, then proceeded to eliminate the top three teams in the standings, winning each series after trailing at some point. In the championship series, they overcame a 3-1 deficit by winning three consecutive games, including the final two on the Titans' home court where the champions had lost only twice all season.

The team's success has captivated Metro City, a mid-sized market that has long lived in the shadow of larger sports cities. Thousands of fans gathered in the downtown area to watch the game on giant screens, and the team's return flight is scheduled to arrive to what city officials expect will be one of the largest celebration gatherings in the city's history.

"This means everything to our community," said longtime fan Maria Rodriguez, who has held season tickets since the franchise's inaugural season. "We're not the biggest city, we don't have the most money, but tonight we're champions because this team showed that heart and togetherness still matter in sports."

The victory is particularly meaningful for Johnson, the team captain who was drafted by the Mavericks eight years ago and stayed loyal through multiple rebuilding phases when he could have sought trades to more successful franchises.

"There were definitely times I wondered if we'd ever get here," Johnson admitted. "But I believed in this city, this organization, and what we were building. Sometimes the harder path leads to the sweeter victory."

For the Titans, the defeat represents a stunning collapse for a team that had dominated the regular season with a 68-14 record and featured three All-League players. Their coach acknowledged being outmaneuvered by Williams' tactical adjustments as the series progressed.

"They forced us to play a style we weren't comfortable with," the Titans' coach conceded. "We kept expecting our talent advantage to prevail, but their system and their togetherness overcame that. They earned this championship."

Sports betting companies reported the Mavericks' championship as one of the most costly outcomes in recent memory, with very few bettors having placed wagers on them at the 100-to-1 preseason odds. One sportsbook confirmed that a Metro City resident had placed a $1,000 bet on the Mavericks before the season, resulting in a $100,000 payout.

As the celebrations continue in Metro City, the team's front office already faces questions about whether they can keep the championship core together, with several key players entering free agency and Coach Williams likely to receive offers from larger market teams.`,
    author: "Kevin Smith",
    source: "Associated Press",
    publishedAt: "2025-05-05T20:00:00Z",
    imageUrl: "/placeholder.svg?height=600&width=800",
    category: "sports",
    url: "/article/16",
    viewCount: getRandomViewCount(),
    comments: generateComments("16", 10),
  },
]
