/* Section 02 — what the framework claims to explain.
 *
 * Ordered by how well each claim stands up, not by how exciting it is. Rows 1-4
 * are statements about the finite object that a reader can check without
 * granting the framework anything; the list gets more conditional downward. A
 * row with two tiers prints both, closed half first. The visual gradient is
 * part of the argument, so no row may be collapsed to its stronger half. */

export const en = {
  number: "02",
  kicker: "WHAT IT CLAIMS TO EXPLAIN",
  h2: "Eleven things it says could not have been otherwise.",
  intro:
    "The section above fixed the object. This one is the list of things the framework claims fall out of it. They are ordered by how well they stand up, not by how exciting they are — the first four are statements about the finite object that you can check without granting the framework anything, and the list gets more conditional as it goes down. Nothing here is a fit.",
  epigraph: {
    text: "知之為知之，不知為不知，是知也。",
    gloss: "To know when you know, and to know when you do not know — that is knowledge.",
    cite: "《論語·為政》 — the author's own epigraph to his predictions-and-tests chapter",
  },
  closedDefTitle: "What “closed” means here — the author's definition, verbatim",
  closedDef:
    "“The word ‘closed’ is used in this monograph in a typed sense. It does not mean that every comparison datum has been promoted to a new axiom, nor that every branch-dependent diagnostic is a Gaussian central-value prediction. It means that, inside the stated carrier, the substrate datum, the geometric certificate, and the permitted readout functor have been fixed before any laboratory or cosmological comparison is made.”",
  closedDefCite: "Introduction, “Closure certificates for first reading”.",
  tagKeyTitle: "The three states used in this list",
  tagKey: [
    ["closed", "CLOSED", "Closed in its own logical class, inside a stated carrier. Not a claim that experiment has confirmed it."],
    ["conditional", "CONDITIONAL", "Derived, but downstream of a stated branch or a named open interface — not of a continuous fit parameter."],
    ["bound", "BOUND / TEST", "A one-sided limit or a future selection surface. Below every bound means untested, not confirmed."],
  ],
  ridesOnLabel: "rides on",
  checkLabel: "check it at",
  rows: [
    {
      n: "01", lead: true, tags: ["closed"],
      h3: "Why the object has four corners.",
      body: "The object has four corners because <em>i</em> has order four. The imaginary unit that the cell emits must be a genuine complex structure — it must really square to −1 — and that unit <em>is</em> the cell's clock, a rotation by 2π/n. A quarter turn squares to −1; a third of a turn does not. So n = 4. The same consistency conditions then force three colours, and over every possible pair (colours, sites), (3, 4) is the only survivor.",
      ridesOn: "Nothing open. It carries a scope, not an interface: cells built from SU(m) fundamental site representations on a graph, with two-site interactions, plus the framework's one remaining postulate — that such cells exist. Under the author's own challenge as Target A.",
      checkAt: "Theorem 4.33 clause (i), the cell-bootstrap section. Machine side: the quarter-turn clock squares to −I and a three-fold clock provably cannot; a companion module kills every n ≥ 5. Zero sorry, zero project axioms.",
    },
    {
      n: "02", lead: true, tags: ["closed", "conditional"],
      h3: "Why there are three generations of matter.",
      body: "Diagonalise the cell exactly and its 81 states split, with no freedom at all, into 15 + 45 + 12 + 9. The 9-dimensional ground block is 3 × 3, and the two threes have completely different parentage: one is the 3 of SU(3) colour, the other is the 3-dimensional Specht module of the group that permutes the tetrahedron's four corners. That second three is this framework's answer to Rabi's ninety-year-old question about the muon — <em>who ordered that?</em> Nobody did; three is simply how many independent ways the corners of a tetrahedron can be labelled. The count is closed mathematics, following from Young-diagram arithmetic rather than from a fit. What is not closed is the last step, the one that turns that three-dimensional slot into three families of fermions living on spacetime.",
      ridesOn: "Erratum E8 — global generation extension, full normal embedding, real physical-branch preservation, and the 48-row current-symbol surjectivity are all still named interfaces. The author's own audit puts it bluntly: Schur multiplicity alone does not prove the spacetime source lift. Bounded also by E10. Targets 8 and 10.",
      checkAt: "Theorem 4.3, “Flavour generations from Schur–Weyl duality”, with Remark 4.4 “Colour vs flavour: no category confusion”; numerical certificate Experiment 071.",
    },
    {
      n: "03", lead: true, tags: ["closed", "conditional"],
      h3: "Why spacetime has four dimensions.",
      body: "Spacetime has four dimensions because the cell's ground state breaks SU(3) down to U(2), and the directions left over — the ones the state can still move in — number exactly 8 − 4 = 4. A second, independent argument pushes from underneath: this framework represents CP violation as a (2,2) form, and a (2,2) form is identically zero in fewer than four dimensions, so a universe with CP violation cannot have fewer. Two further constraints land on the same answer; the monograph calls it a fourfold lock rather than a single theorem. <strong>The four corners and the four dimensions are two different fours</strong>, reached by two different arguments — the corners by the order of <em>i</em>, the dimensions by a coset dimension count. The framework locks them to the same carrier; it never claims one is the other.",
      ridesOn: "The SU(3) selection, which is internal and closed. The four dimensions are Euclidean until the modular clock supplies time; the Euclidean-to-Lorentzian transfer runs through the quotient, modular-Wick and diffeomorphism-Ward maps that erratum E7 names as separate. Targets 2 and 3.",
      checkAt: "“Four spacetime dimensions as topological necessity” in the K4-cell chapter — the topological-necessity theorem and the Berry-form CP obstruction theorem, both closed, plus the fourfold-selection remark.",
    },
    {
      n: "04", tags: ["closed"],
      h3: "Why nothing else about the object was chosen either.",
      body: "It is not only the four. Within the stated class, every structural feature is forced by internal consistency and no experimental number enters any clause: four sites, three colours, the permutation form of the interaction, the complete graph, one uniform coupling, and the antiferromagnetic sign — that last one over-determined by two independent routes. What the framework still posits about its substrate is that such cells exist. Their structure is a theorem.",
      ridesOn: "Nothing open; the class boundary and the existence clause, as in row 01. E10 caps the theorem's closing readout-closure sentence. Target A.",
      checkAt: "Theorem 4.33 and Remark 4.34. Five Lean modules, zero sorry, axioms within the three standard logical axioms; the graph clause exhaustively machine-checked on all 64 labelled graphs.",
    },
    {
      n: "05", tags: ["closed", "conditional"],
      h3: "Where the imaginary unit of quantum mechanics comes from.",
      body: "The engine is real. Start from a real substrate with a real symmetric Hamiltonian — no <em>i</em> anywhere — and push a particle around the cell's closed four-site loop. The loop's four-fold symmetry hands it a phase it cannot gauge away, and that phase is <em>i</em>. In the author's words: complex quantum mechanics is the geometric price of closing a two-dimensional loop. The experiments that ruled out real-number quantum mechanics are cited here as an external check on that picture, not as an ingredient in it.",
      ridesOn: "The theorem's own conditional half — the compositional gluing that promotes the local ±J plane to a single global complex scalar. The representation half is closed.",
      checkAt: "“Emergence of i on K4 from three ingredients” and its Representation Lemma, real-vacuum chapter; the loop-closing passage; Experiment 074, the Z₄ location of the imaginary unit.",
    },
    {
      n: "06", tags: ["closed", "conditional"],
      h3: "Why the charges are the odd fractions they are.",
      body: "The Standard Model's hypercharges are a strange little list — 1/6, 2/3, −1/3, −1/2, −1, 0, 1/2 — and nobody knows why. Here seven anonymous rows of the substrate, labelled only by where they sit and what they carry, with no particle names attached, are forced to the integers (1, 4, −2, −3, −6, 0, 3) by anomaly cancellation together with one single integer lift, δ = −5, that three independent equations over-determine. Multiply the Standard Model's hypercharges by six and you get that list, in order. The names — quark doublet, up, down, lepton doublet, electron, right-handed neutrino, Higgs — are attached afterwards; no equation in the derivation uses them.",
      ridesOn: "E8, the same four named maps as row 02. Target 8.",
      checkAt: "“Anonymous carrier uniqueness for the typed SM product”, and the chiral-anomaly-dressing theorem that forces δ = −5, in the multi-cell chapter.",
    },
    {
      n: "07", tags: ["closed", "bound"],
      h3: "Why the strong force shows no CP violation, and why there is no axion.",
      body: "The strong force is allowed to violate CP and does not: experiment puts the angle below 10⁻¹⁰, and the standard repair is to invent a new particle, the axion, whose whole job is to relax it to zero. Here the tetrahedron's own symmetry does the job. Relabelling the four corners reverses the orientation of the cell and therefore flips the sign of the topological charge, so the vacuum angle cannot be continuously adjustable at all — only θ = 0 and θ = π survive — and the framework's real vacuum sits on 0. No axion is required. A QCD axion found at IAXO or ALPHA would put the world outside this branch.",
      ridesOn: "The real-vacuum branch selection; the radiative and quark-mass stability of the physical angle rides on a separate closure. On the comparison side this is a bound row — below every current limit means untested, not confirmed.",
      checkAt: "“Topological prohibition of θ_QCD”, K4-cell chapter, with the QGT-Hermiticity strong-CP theorem; branch-selection Test 1 in the predictions chapter.",
    },
    {
      n: "08", tags: ["closed", "conditional"],
      h3: "Why gravity and the gauge forces are one geometry read twice.",
      body: "One tensor on the space of the object's quantum states has a real part and an imaginary part. The real part measures how distinguishable two states are and becomes metric geometry. The imaginary part measures holonomy and becomes gauge curvature. That both come off the same object is closed — the exact statement is a Pythagoras identity, and it is a theorem. That their <em>dynamics</em> therefore arrive together — Einstein's equations and Yang–Mills from one source rather than glued side by side — is this framework's central bet. It is written down as a conditional system with its conditions named, and the author's own carved-out paper on it is titled <em>Conditional Einstein–Yang–Mills Field Equations</em>.",
      ridesOn: "E3, E4, E7 and E11. Targets 1 and 2.",
      checkAt: "The projective holographic isometry / tangent-space Pythagoras theorem, emergent-geometry chapter; the response-filtered Einstein–Yang–Mills substrate equations; and paper 2, CQG-116665, under review.",
    },
    {
      n: "09", tags: ["conditional"],
      h3: "Inflation with no inflaton, and how it stops.",
      body: "Standard inflation needs a field invented for the job, with a potential whose shape is chosen by hand and then tuned. Here inflation is a phase the substrate already has: of six discrete curvature orbits the cell possesses, one has positive curvature — a de Sitter island — and crossing it in modular time is the inflationary epoch. It ends by itself when the curvature profile crosses a critical line into the next orbit. No inflaton, no potential to tune, no separate reheating field. The Hubble scale it reads out is about 1.7 × 10¹⁵ GeV.",
      ridesOn: "The selected de Sitter island branch, and the same scale-line branch that fixes Λ_K4 in row 11. The e-fold count is explicitly a conditional readout carrying a reheating-efficiency correction.",
      checkAt: "“K4 substrate contains a de Sitter UV island” and “K4 dS-island traversal is the cosmological inflationary branch”, cosmology chapter and the Read_cosmo appendix.",
    },
    {
      n: "10", tags: ["conditional"],
      h3: "Why there is more matter than antimatter, and why time runs one way.",
      body: "The cell's four-fold clock can tell +<em>i</em> from −<em>i</em>. The framework follows that one distinction outward along a four-arrow chain: into the neutrino mixing phase, into the leptogenesis asymmetry, into matter outnumbering antimatter, and finally into the direction time runs. Every arrow is a conditional readout, and the chain ends in a measurement rather than a flourish — the framework requires sin δ_CP to be negative, so a positive value from DUNE or Hyper-K ends it. The orientation itself is deliberately <em>not</em> derived; it is spontaneously selected vacuum data, which is exactly what makes the sign lock a test and not a fit.",
      ridesOn: "Each link is a selected or conditional readout at a different RG depth. Target C.",
      checkAt: "The i-emergence theorem; the UV/IR δ_CP theorem; the leptogenesis-from-PMNS-Berry theorem; the arrow-of-time corollary, cosmology chapter.",
    },
    {
      n: "11", tags: ["conditional"],
      h3: "And the point of all of it: nineteen numbers, then one, then none.",
      body: "In this framework the Standard Model's roughly nineteen measured constants are not nineteen independent facts. The substrate's algebraic channels emit the dimensionless ones at zero continuous fitting cost, leaving a single energy scale; the K4 anomaly unification theorem then locks that last continuous scale to one whole number — ν₃ = +1, the tetrahedron's four corners counted modulo three. The locking step is closed in its mod-3 arithmetic and in a machine-verified bordism identification, with the residue reduced to two named hypotheses about what the substrate is allowed to source. It holds on one selected branch; it keeps the Planck mass as a unit of measurement rather than deriving it; and the identification of the substrate's chiral content with the complete Standard-Model carrier is still carried by named open interfaces. The comparison the monograph itself invites is Green–Schwarz: one anomaly condition fixing the structure of an entire theory.",
      ridesOn: "The Spin/no-Pin matter-source typing clause; the SymTFT product-structure clause; the symmetric-mass-generation decoupling branch; the b₀ convention fork; the honeycomb selection that centres Λ_K4 near 3 × 10¹⁵ GeV; the Planck mass retained as the unit; and E8 for the carrier. Targets D and 8.",
      checkAt: "Theorem 7.6 (K4 anomaly unification) and Theorem 7.7 (K4 decoupling), cosmology chapter; the bordism scaffold theorem in the anomaly-unification appendix. The first arrow, nineteen to one, is a ledger statement rather than a theorem; only the second arrow is theorem-backed.",
    },
  ],
  holoTitle: "Three layers, and one narrow use of the word “holographic.”",
  holo: [
    "The framework has three strata and says so plainly: a microscopic layer, the finite 81-dimensional Hilbert space of the cell; a parameter manifold carrying the Fisher metric and the Berry connection; and an emergent spacetime, the long-wavelength Fisher manifold, with Lorentzian time supplied by a modular construction rather than assumed. The monograph does use the words boundary and bulk throughout — but here “boundary” names the original Hilbert space and its state manifold, and “bulk” names the variational parameter manifold. They are not two spacetimes, and neither of them is a two-dimensional surface.",
    "The word holographic is narrowed by the author himself, in the theorem where it appears: it refers to the faithful tangent readout from a boundary displacement into the bulk Fisher tangent image. The exact statement is a Pythagoras identity — the boundary distance equals the bulk distance plus a representation error, and the two coincide when that error vanishes. That identity is closed. Bulk locality, the reconstruction envelope, and all dynamics enter through separate results and do not follow from the projector identity alone.",
    "Conformal invariance, holographic duality and AdS/CFT are not premises of this route; the framework deliberately steps outside them. Where it does reach for a genuinely holographic dictionary — the radial direction as entanglement depth, in the Swingle–Vidal sense — that dictionary is typed conditional, and whether the modular-depth coordinate survives comparison with known tensor-network radial reconstruction is one of the author's own open review targets.",
  ],
};

export const zh = {
  number: "02",
  kicker: "它声称解释了什么",
  h2: "十一件它认为本来就不可能是别的样子的事。",
  intro:
    "上一节把这个对象固定下来了。这一节是它声称能从这个对象里掉出来的东西的清单。排序依据是站得有多稳，而不是听上去有多惊人——前四条是关于这个有限对象本身的陈述，你不必先认可这个框架就能去查；越往下，条件性越强。这里没有任何一条是拟合出来的。",
  epigraph: {
    text: "知之為知之，不知為不知，是知也。",
    gloss: "",
    cite: "《論語·為政》——作者亲手放在「预言与检验」一章卷首的题词",
  },
  closedDefTitle: "这里的「闭合」是什么意思——作者本人的定义，原文照录",
  closedDef:
    "「本专著中的『闭合』一词是在带类型的意义上使用的。它并不意味着每一个对照数据都被提升为新的公理，也不意味着每一个依赖分支的诊断量都是高斯中心值预言。它的意思是：在所声明的载体之内，基底数据、几何证书与被允许的读出函子，都在任何实验室或宇宙学对照做出之前就已经固定下来。」",
  closedDefCite: "见「首读闭合证书」一节，引论章。",
  tagKeyTitle: "本清单使用的三种状态",
  tagKey: [
    ["closed", "闭合", "在它自身的逻辑类别内闭合，且限定在所声明的载体之内。这不等于说实验已经证实了它。"],
    ["conditional", "条件性", "已推导，但位于某个已声明的分支或某条具名开放接口的下游——不是位于某个连续拟合参数的下游。"],
    ["bound", "界 / 检验", "单边限，或未来的分支选择面。低于所有现有上限只表示尚未被检验，不表示已被证实。"],
  ],
  ridesOnLabel: "依赖于",
  checkLabel: "去查",
  rows: [
    {
      n: "01", lead: true, tags: ["closed"],
      h3: "这个对象为什么有四个角。",
      body: "这个对象有四个角，是因为 <em>i</em> 的阶是四。元胞给出的那个虚数单位必须是真正的复结构——它的平方必须真的等于 −1——而这个单位就是元胞的时钟，即 2π/n 的转动。四分之一圈的平方等于 −1；三分之一圈不行。所以 n = 4。同一套自洽条件接着逼出三种颜色；遍历所有可能的（颜色数, 格点数），只有 (3, 4) 活了下来。",
      ridesOn: "没有开放接口。它带的是一个适用范围，不是一条接口：图上由 SU(m) 基本表示构成的格点、两体相互作用，再加上框架仅剩的那一条设定——这样的元胞存在。作者自己把它挂为审查靶点 A。",
      checkAt: "定理 4.33 第 (i) 款，元胞自举一节。机器一侧：四分之一圈的时钟平方等于 −I，而三阶时钟可证不行；配套模块排除了所有 n ≥ 5。零 sorry，零项目公理。",
    },
    {
      n: "02", lead: true, tags: ["closed", "conditional"],
      h3: "物质为什么有三代。",
      body: "把这个元胞精确对角化，它的 81 个态毫无自由度地裂成 15 + 45 + 12 + 9。其中 9 维的基态块是 3 × 3，而这两个「3」的来源截然不同：一个是 SU(3) 色的 3，另一个是置换四面体四个角那个群的 3 维 Specht 模。后一个 3，就是本框架对拉比问了九十年的那句话——<em>「谁点的这道菜？」</em>——给出的答案：没有谁点；三，不过是给四面体的四个角贴标签时相互独立的方式的数目。这个计数是闭合的数学，由杨图算术直接给出，不是拟合出来的。不闭合的是最后一步：把这个三维槽位真正落实成时空上三代费米子。",
      ridesOn: "勘误 E8——世代扩张、完整正规嵌入、实物理分支保持、48 行流符号满射，全都仍是具名接口。作者自己的审计说得很直白：单靠 Schur 重数并不能证明时空源提升。同时受 E10 约束。靶点 8 与 10。",
      checkAt: "定理 4.3「由 Schur–Weyl 对偶给出的味世代」，及注 4.4「色与味：不作范畴混同」；数值证书实验 071。",
    },
    {
      n: "03", lead: true, tags: ["closed", "conditional"],
      h3: "时空为什么是四维。",
      body: "时空是四维的，因为元胞的基态把 SU(3) 破缺到 U(2)，而剩下的那些方向——态还能动的方向——恰好是 8 − 4 = 4 个。第二条独立的论证从下方顶住：本框架把 CP 破坏表示成一个 (2,2) 形式，而 (2,2) 形式在低于四维时恒为零，所以一个存在 CP 破坏的宇宙不可能更低维。另有两条约束落在同一个答案上；专著称之为一把「四重锁」，而不是一条定理。<strong>四个角与四个维度，是两个不同的「四」</strong>，由两条不同的论证得到——角来自 <em>i</em> 的阶，维度来自陪集的维数计算。框架把它们锁在同一个载体上；但从未声称二者是同一回事。",
      ridesOn: "SU(3) 的选出，这一步是内部的、闭合的。在模时钟给出时间之前，那四个维度是欧氏的；欧氏到洛伦兹的转移要经过勘误 E7 明确列为独立的商映射、模-Wick 映射与微分同胚-Ward 映射。靶点 2 与 3。",
      checkAt: "K4 元胞一章「四维时空作为拓扑必然」一节——拓扑必然性定理与 Berry 形式的 CP 阻碍定理，两条都是闭合的，另加「D = 4 的四重选出」一则注记。",
    },
    {
      n: "04", tags: ["closed"],
      h3: "这个对象的其余部分为什么也不是选出来的。",
      body: "不只是那个「四」。在所声明的类别之内，每一项结构特征都由自洽性逼出，且没有任何实验数值进入其中任何一条：四个格点、三种颜色、置换型的相互作用形式、完全图、一个均匀耦合，以及反铁磁符号——最后这一条还由两条独立路线重复确定。框架对基底仍然设定的，只是「存在这样的元胞」。它们的结构是定理。",
      ridesOn: "没有开放接口；只有第 01 行那条类别边界与存在性条款。E10 对该定理收尾那句读出闭合语作了封顶。靶点 A。",
      checkAt: "定理 4.33 与注 4.34。五个 Lean 模块，零 sorry，公理不超出三条标准逻辑公理；图的那一款在全部 64 个带标号图上被穷举机器核验。",
    },
    {
      n: "05", tags: ["closed", "conditional"],
      h3: "量子力学里的虚数单位从哪里来。",
      body: "引擎是实的。从一个实的基底、一个实对称的哈密顿量出发——任何地方都没有 <em>i</em>——让一个粒子绕元胞那条四格点的闭合回路走一圈。回路的四阶对称性会交给它一个无法用规范变换消去的相位，而那个相位就是 <em>i</em>。用作者自己的话说：复数量子力学，是闭合一个二维回路所付的几何代价。那些排除了实数量子力学的实验，在这里是对这幅图像的外部检验，而不是它的原料。",
      ridesOn: "该定理自身条件性的那一半——把局域的 ±J 平面提升为单一整体复标量的合成粘合。表示的那一半是闭合的。",
      checkAt: "实真空一章「K4 上 i 的涌现：三种成分」及其表示引理；回路闭合那一段；实验 074，虚数单位的 Z₄ 定位。",
    },
    {
      n: "06", tags: ["closed", "conditional"],
      h3: "电荷为什么偏偏是那几个古怪的分数。",
      body: "标准模型的超荷是一串古怪的小清单——1/6、2/3、−1/3、−1/2、−1、0、1/2——没有人知道为什么。在这里，基底的七个匿名行（只按它们所处的位置和所带的东西标记，不贴任何粒子名）被反常相消，连同一个整数提升 δ = −5（由三条独立方程重复确定），逼到整数组 (1, 4, −2, −3, −6, 0, 3)。把标准模型的七个超荷乘以六，得到的正是这串数，顺序一致。那些名字——夸克双重态、上、下、轻子双重态、电子、右手中微子、希格斯——是最后才贴上去的；推导中没有任何一个方程用到它们。",
      ridesOn: "E8，与第 02 行相同的四条具名映射。靶点 8。",
      checkAt: "多元胞一章「带类型标准模型积的匿名载体唯一性」，以及逼出 δ = −5 的手征反常敷层定理。",
    },
    {
      n: "07", tags: ["closed", "bound"],
      h3: "强相互作用为什么不破坏 CP，以及为什么没有轴子。",
      body: "强相互作用本来是允许破坏 CP 的，但它没有：实验把这个角压到 10⁻¹⁰ 以下，而标准的补救办法是发明一种新粒子——轴子——它唯一的职责就是把这个角弛豫到零。在这里，是四面体自身的对称性完成了这件事。给四个角重新编号会反转元胞的取向，从而把拓扑荷的符号翻过来，于是这个真空角根本不可能连续可调——只剩 θ = 0 与 θ = π 两支——而框架的实真空落在 0 上。不需要轴子。IAXO 或 ALPHA 若找到 QCD 轴子，世界就落在这个分支之外。",
      ridesOn: "实真空分支的选出；物理角在辐射修正与夸克质量下的稳定性另挂一条闭合。在对照一侧这是一条「界」行——低于现有所有上限只表示尚未被检验，不表示已被证实。",
      checkAt: "K4 元胞一章「θ_QCD 的拓扑禁戒」，配 QGT 厄米性强 CP 定理；预言一章的分支选择检验 1。",
    },
    {
      n: "08", tags: ["closed", "conditional"],
      h3: "引力与规范力为什么是同一个几何读了两遍。",
      body: "在这个对象的量子态空间上，有一个张量，它有实部也有虚部。实部度量两个态有多可分辨，成为度规几何；虚部度量和乐，成为规范曲率。两者出自同一个对象——这一步是闭合的，其精确陈述是一条勾股恒等式，是一条定理。至于它们的<em>动力学</em>因此一并到来——爱因斯坦方程与杨-米尔斯出自同一个源头，而不是并排粘在一起——这是本框架的核心赌注。它被写成一个条件性的方程组，条件逐条具名；作者从中拆分出去投稿的那篇论文，标题就叫《条件性爱因斯坦-杨-米尔斯场方程》。",
      ridesOn: "E3、E4、E7 与 E11。靶点 1 与 2。",
      checkAt: "涌现几何一章的射影全息等距／切空间勾股定理；Grassmann 一章的响应筛选 Einstein–Yang–Mills 基底方程；以及在审的第二篇论文 CQG-116665。",
    },
    {
      n: "09", tags: ["conditional"],
      h3: "没有暴胀子的暴胀，以及它怎么停下来。",
      body: "标准的暴胀需要为此专门发明一个场，它的势能形状先用手挑出来，再去调参。这里，暴胀是基底本来就有的一个阶段：元胞拥有的六条离散曲率轨道中，有一条曲率为正——一座德西特岛——在模时间里穿过它，就是暴胀期。它自行结束：曲率剖面越过一条临界线，进入下一条轨道。没有暴胀子，没有要调的势，也不需要另加再加热场。它读出的哈勃标度约为 1.7 × 10¹⁵ GeV。",
      ridesOn: "被选出的德西特岛分支，以及第 11 行中定下 Λ_K4 的同一条标度线分支。e-folds 计数被明确标为带再加热效率修正的条件性读出。",
      checkAt: "宇宙学一章与 Read_cosmo 附录：「K4 基底含有一座德西特紫外岛」，及「K4 德西特岛穿越即宇宙学暴胀分支」。",
    },
    {
      n: "10", tags: ["conditional"],
      h3: "为什么物质多于反物质，以及时间为什么只朝一个方向走。",
      body: "元胞那个四阶的时钟能分辨 +<em>i</em> 与 −<em>i</em>。框架把这一个区分沿着一条四箭头的链条一路往外推：推到中微子混合的相位，推到轻子生成的不对称，推到物质多于反物质，最后推到时间流动的方向。每一支箭头都是一次条件性读出，而这条链条的终点是一次测量，不是一句漂亮话——框架要求 sin δ_CP 为负，因此 DUNE 或 Hyper-K 若测到正值，它就结束了。取向本身是<em>故意不推导</em>的：它是自发选定的真空数据，而这恰恰使这把符号锁成为一次检验，而不是一次拟合。",
      ridesOn: "每一环都是不同重整化深度上的一次选出或条件性读出。靶点 C。",
      checkAt: "i 涌现定理；紫外／红外 δ_CP 定理；由 PMNS Berry 相位给出轻子生成的定理；宇宙学一章的时间之箭推论。",
    },
    {
      n: "11", tags: ["conditional"],
      h3: "以及这一切的意义：十九个数，然后一个，然后零个。",
      body: "在本框架中，标准模型那约十九个实测常数并非十九个彼此独立的事实。基底的代数通道以零连续拟合代价给出其中的无量纲量，只余下单一能标；随后 K4 反常统一定理把这最后一个连续标度锁定到一个整数上——ν₃ = +1，也就是四面体的四个角对 3 取模。这一锁定步骤在其 mod-3 算术与经机器核验的配边识别上是闭合的，残留仅归结为两条关于「基底允许源出什么」的具名假设。它成立于一个被选定的分支之上；普朗克质量仍作为计量单位保留，而不是被导出；而把基底的手征内容等同于完整的标准模型载体，目前仍由若干具名的开放接口承担。专著自己援引的类比是 Green–Schwarz 机制：一个反常条件锁定整个理论的结构。",
      ridesOn: "Spin／no-Pin 物质源类型条款；SymTFT 积结构条款；对称质量生成解耦分支；b₀ 约定分岔；把 Λ_K4 定在 3 × 10¹⁵ GeV 附近的蜂窝选择；作为单位保留的普朗克质量；以及载体一侧的 E8。靶点 D 与 8。",
      checkAt: "宇宙学一章定理 7.6（K4 反常统一）与定理 7.7（K4 解耦）；反常统一附录中的配边支架定理。第一支箭头「十九到一」是一条账本陈述，不是定理；只有第二支箭头有定理支撑。",
    },
  ],
  holoTitle: "三个层次，以及「全息」一词的一处狭义用法。",
  holo: [
    "本框架有三个层次，并且明说了：微观层，即元胞那个 81 维的有限希尔伯特空间；参数流形，其上带有 Fisher 度规与 Berry 联络；以及涌现时空，即长波极限下的 Fisher 流形，而其中的洛伦兹时间由一个模构造给出，而不是被假定。专著确实通篇使用「边界」与「体」这两个词——但这里的「边界」指的是原始的希尔伯特空间及其态流形，「体」指的是变分参数流形。它们不是两个时空，也没有哪一个是二维曲面。",
    "「全息」一词由作者本人在使用它的那条定理处收窄：它指的是从一个边界位移到体的 Fisher 切像的忠实切空间读出。其精确陈述是一条勾股恒等式——边界距离等于体距离加上一个表示误差，当该误差为零时两者重合。这条恒等式是闭合的。体的局域性、重构包络以及全部动力学，都经由另外的结果进入，不能仅凭这条投影恒等式得出。",
    "共形不变性、全息对偶与 AdS/CFT 都不是这条路线的前提；本框架是刻意走到它们之外的。而在它确实伸手去取一部真正的全息词典之处——把径向方向读作 Swingle–Vidal 意义下的纠缠深度——那部词典被标为条件性；至于模深度坐标能否经受住与已知张量网络径向重构的对照，则是作者自己挂出的公开审查靶点之一。",
  ],
};
