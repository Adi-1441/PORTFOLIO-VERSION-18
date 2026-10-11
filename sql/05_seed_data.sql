-- ==============================================================================
-- ADITHYA MECHNEXUS V18.0 — AUTHENTIC INITIAL SEED DATA
-- Pure mechanical engineering data based on Adithya's verified work.
-- ==============================================================================

-- 1. PROFILE
INSERT INTO public.profile (
  id, full_name, title, tagline, bio, email, location, resume_version,
  seo_title, seo_description
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Adithya G',
  'Mechanical Engineering Student',
  'Mechanical Design • CAD/CAE • FEA • CFD • Thermal • Industrial Automation • AI × Engineering',
  'Dedicated Mechanical Engineering student with hands-on expertise in finite element analysis, computational fluid dynamics, parametric 3D CAD modeling, industrial automation logic, and machine intelligence integrations for engineering systems.',
  'adithya@mechnexus.engineering',
  'India',
  'V18.0',
  'ADITHYA MECHNEXUS | Mechanical Engineering Digital Laboratory',
  'Official mechanical engineering portfolio of Adithya G — CAD/CAE, FEA, CFD, PLC Industrial Automation, and AI × Engineering.'
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  title = EXCLUDED.title,
  tagline = EXCLUDED.tagline,
  bio = EXCLUDED.bio;

-- 2. ABOUT
INSERT INTO public.about (
  id, content, engineering_interests, technical_direction, design_philosophy, engineering_approach, learning_direction, enabled
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'I am a passionate Mechanical Engineering student pursuing deep practical mastery across the physical and digital boundaries of modern engineering. My work focuses on rigorous multi-physics simulations, parametric CAD design, industrial automation sequences, and the integration of machine learning algorithms to optimize mechanical performance and manufacturing throughput.',
  ARRAY['Finite Element Analysis (FEA)', 'Computational Fluid Dynamics (CFD)', 'Heat Transfer & Thermal Design', 'Industrial Automation & PLC', 'Kinematics & Machine Dynamics', 'AI-Assisted Engineering Optimization'],
  'Developing high-fidelity multi-physics simulation methodologies, closed-loop industrial automation sequences, and AI-accelerated parametric design pipelines.',
  'Form adheres strictly to thermodynamic, mechanical, and manufacturability constraints. Precision over decoration; numerical verification over intuition.',
  'Rigorous mathematical formulation followed by high-density CAD modeling, mesh-independent FEA/CFD convergence, and physical experimental validation.',
  'Advancing from classical solid mechanics toward multi-domain digital twins, surrogate AI simulation models, and real-time PLC telemetry integration.',
  true
) ON CONFLICT (id) DO NOTHING;

-- 3. NAVIGATION ITEMS
INSERT INTO public.navigation_items (label, href, display_order, enabled) VALUES
  ('HOME', '#hero', 0, true),
  ('ABOUT', '#about', 1, true),
  ('SKILLS', '#skills', 2, true),
  ('PROJECTS', '#projects', 3, true),
  ('RESEARCH', '#research', 4, true),
  ('CAD & CAE', '#cad-cae', 5, true),
  ('PLC & AUTOMATION', '#plc', 6, true),
  ('CERTIFICATIONS', '#certifications', 7, true),
  ('AI × ENGINEERING', '#ai-engineering', 8, true),
  ('ARTICLES', '#articles', 9, true),
  ('RESUME', '#resume', 10, true),
  ('CONNECTIONS', '#connections', 11, true),
  ('CONTACT', '#contact', 12, true);

-- 4. SECTION VISIBILITY
INSERT INTO public.section_visibility (section_key, label, visible, display_order) VALUES
  ('hero', 'Hero & Digital Laboratory', true, 0),
  ('about', 'Engineering Profile & Philosophy', true, 1),
  ('skills', 'Capability Matrix', true, 2),
  ('projects', 'Engineering Projects', true, 3),
  ('research', 'Scientific Research', true, 4),
  ('cad-cae', 'CAD & CAE Simulations', true, 5),
  ('plc', 'PLC & Industrial Automation', true, 6),
  ('certifications', 'Credentials & Certifications', true, 7),
  ('ai-engineering', 'AI × Engineering', true, 8),
  ('articles', 'Technical Dossiers & Notes', true, 9),
  ('resume', 'Engineering Resume Dossier', true, 10),
  ('connections', 'Professional Connections', true, 11),
  ('contact', 'Laboratory Comms & Contact', true, 12)
ON CONFLICT (section_key) DO NOTHING;

-- 5. SKILLS MATRIX
INSERT INTO public.skills (name, category, description, level, tools, icon, display_order) VALUES
  ('Parametric Solid Modeling', 'CAD', 'Parametric part and assembly modeling, GD&T, top-down assembly architecture, and manufacturing drafting.', 'expert', ARRAY['SolidWorks', 'CATIA V5', 'Autodesk Inventor'], 'Box', 0),
  ('Structural & Stress FEA', 'FEA', 'Static structural, modal frequency analysis, nonlinear contact mechanics, and factor-of-safety evaluation.', 'advanced', ARRAY['ANSYS Mechanical', 'SolidWorks Simulation'], 'Activity', 1),
  ('Computational Fluid Dynamics', 'CFD', 'Navier-Stokes discretization, internal pipe flow, turbulence modeling (k-epsilon, SST k-omega), and boundary layer separation.', 'advanced', ARRAY['ANSYS Fluent', 'CFD-Post'], 'Wind', 2),
  ('Conjugate Heat Transfer', 'THERMAL', 'Conduction, forced convection heat sinks, shell-and-tube exchangers, and thermal gradient optimization.', 'advanced', ARRAY['ANSYS Fluent', 'Thermal Analysis Solvers'], 'Flame', 3),
  ('Mesh Generation & Independence', 'CAE', 'Structured boundary layer inflation, tetrahedral/hexahedral meshing, skewness and orthogonal quality validation.', 'expert', ARRAY['ANSYS Meshing', 'ICEM CFD'], 'Grid', 4),
  ('Design for Manufacturing (DFM/DFA)', 'MANUFACTURING', 'Tolerancing, machining allowances, injection molding draft angles, sheet metal unfolding, and assembly ergonomics.', 'advanced', ARRAY['GD&T ASME Y14.5', 'SolidWorks CAM'], 'Tool', 5),
  ('Dimensional Metrology & Inspection', 'METROLOGY', 'Coordinate measuring principles, optical comparator tolerance verification, and precision vernier/micrometer calipers.', 'intermediate', ARRAY['Vernier Calipers', 'CMM Inspection Basics', 'Dial Indicators'], 'Compass', 6),
  ('Ladder Logic & PLC Programming', 'PLC', 'Deterministic ladder diagram (LD) sequences, timers, counters, interlocks, and state-machine architecture.', 'advanced', ARRAY['Rockwell Connected Components Workbench', 'Siemens TIA Portal Basics'], 'Sliders', 7),
  ('Industrial Automation & Mechatronics', 'INDUSTRIAL AUTOMATION', 'Pneumatic actuators, solenoid valves, inductive proximity sensors, and closed-loop relay control.', 'advanced', ARRAY['Pneumatic Circuit Simulators', 'Relay Logic'], 'Layers', 8),
  ('Industrial Robotics & Kinematics', 'ROBOTICS', 'Forward and inverse kinematics for 6-DOF industrial manipulators, pick-and-place trajectories, and end-effector design.', 'intermediate', ARRAY['RoboDK', 'MATLAB Kinematics'], 'Cpu', 9),
  ('Engineering Programming & Computation', 'PROGRAMMING', 'Numerical algorithms, matrix decomposition, ODE solvers, and automated CAD parameter scripting.', 'advanced', ARRAY['Python', 'NumPy', 'SciPy', 'MATLAB'], 'Terminal', 10),
  ('Physics-Informed ML & Surrogates', 'AI × ENGINEERING', 'Training neural surrogate models on FEA/CFD output data to achieve real-time parametric design optimization.', 'advanced', ARRAY['PyTorch', 'Scikit-Learn', 'Pandas'], 'Brain', 11),
  ('Experimental Methodology', 'RESEARCH', 'Standardized specimen tensile testing (ASTM D638/D3039), composite laminate fabrication, and SEM fractography.', 'advanced', ARRAY['Universal Testing Machine (UTM)', 'Optical Microscopy'], 'Microscope', 12);

-- 6. PROJECTS
INSERT INTO public.projects (
  title, slug, short_description, full_description, problem_statement, objective,
  methodology, engineering_approach, tools_software, materials, results, learning_outcome,
  status, category, tags, featured, display_order
) VALUES
  (
    'Shell and Tube Heat Exchanger Parametric CAD & Assembly',
    'shell-and-tube-heat-exchanger-cad',
    'Parametric 3D design and mechanical assembly of an industrial BEM-type shell and tube heat exchanger compliant with TEMA standards.',
    'A comprehensive mechanical engineering project involving the full geometric specification, tube-sheet layout optimization, baffle spacing design, and parametric assembly of an industrial-grade shell and tube heat exchanger. Modeled under strict adherence to TEMA (Tubular Exchanger Manufacturers Association) Class C guidelines.',
    'Process fluid cooling in chemical processing requires high thermal throughput while maintaining structural integrity against hydraulic pressure loads and thermal expansion stresses.',
    'Design an optimized 1-shell, 2-tube pass heat exchanger with parametric controllability over tube pitch ratio, baffle cut percentage, and shell diameter.',
    'Formulated thermodynamic heat duty calculations followed by mechanical design of pressure retaining components. Implemented parametric geometric relations in SolidWorks for automatic scaling based on thermal capacity requirements.',
    'Conducted structural thickness validation for shell and dished heads according to ASME Section VIII Division 1 guidelines.',
    ARRAY['SolidWorks', 'AutoCAD', 'ASME Section VIII Div 1', 'TEMA Guidelines'],
    ARRAY['Carbon Steel SA-516 Gr 70', 'Copper-Nickel Alloy Tubes', 'EPDM Gaskets'],
    'Successfully produced fully constrained 3D assembly comprising 140 tubes, 8 segmental baffles (25% cut), floating head cover, and complete Bill of Materials (BOM) with GD&T drawings.',
    'Gained deep proficiency in TEMA standards, tube bundle vibration considerations, gasket seating stress calculations, and mechanical manufacturing tolerances.',
    'completed',
    'MECHANICAL DESIGN',
    ARRAY['Heat Exchanger', 'SolidWorks', 'TEMA', 'Thermal Design', 'CAD Modeling'],
    true,
    0
  ),
  (
    'Steady-State Thermal & Structural FEA of Microchannel Heat Sink',
    'microchannel-heat-sink-fea',
    'Coupled thermal and structural FEA of high-heat-flux copper microchannel heat sinks subjected to semiconductor power dissipation.',
    'Numerical finite element study assessing the junction temperature, thermal gradient distribution, and resulting thermal expansion stresses within high-density copper microchannel heat sinks operating under 150 W/cm² heat flux.',
    'Modern power electronics and high-performance computing chipsets generate localized heat fluxes exceeding 100 W/cm², causing thermal hotspots, solder joint fatigue, and device failure.',
    'Determine the optimal fin thickness-to-pitch aspect ratio that minimizes thermal resistance while keeping thermal stresses well below copper yield strength.',
    'Constructed 3D representative volume element (RVE) with symmetry boundary conditions. Performed mesh independence study with five grid densities up to 850,000 quadratic tetrahedral elements. Applied conjugate convective boundary conditions from fluid flow correlations.',
    'Sequential thermo-mechanical coupling: thermal temperature field imported as nodal body load for the subsequent elastic stress solution.',
    ARRAY['ANSYS Mechanical', 'ANSYS Workbench', 'SolidWorks', 'MATLAB'],
    ARRAY['Oxygen-Free High Conductivity Copper (C10100)', 'TIM2 Thermal Interface'],
    'Max junction temperature reduced from 84.2°C to 63.8°C with optimized 200 µm fin channels. Maximum Von Mises thermal stress reached 68.4 MPa, comfortably below the 140 MPa yield limit.',
    'Mastered mesh convergence verification metrics (Grid Convergence Index - GCI), multi-field sequential loading, and thermo-elastic stress mitigation strategies.',
    'completed',
    'CAE / FEA',
    ARRAY['FEA', 'Thermal Analysis', 'ANSYS Mechanical', 'Heat Sink', 'Stress Analysis'],
    true,
    1
  ),
  (
    'Experimental Characterization of Jute/Epoxy Biodegradable Composites',
    'jute-epoxy-biodegradable-composites',
    'Fabrication, tensile testing, and fracture analysis of eco-friendly woven jute fiber reinforced epoxy polymer laminates.',
    'Investigating the mechanical viability of natural bio-composite materials as sustainable alternatives to glass-fiber reinforced plastics (GFRP) in secondary structural and automotive interior applications.',
    'Synthetic composite materials like carbon and glass fibers entail high embodied energy and pose substantial end-of-life environmental hazards.',
    'Synthesize vacuum-assisted resin infusion jute/epoxy laminates and quantify tensile modulus, ultimate tensile strength, and flexural stiffness as a function of fiber weight fraction.',
    'Alkali chemical surface treatment (5 wt% NaOH) of raw woven jute fibers to remove hemicellulose and lignin, followed by hand lay-up with compression molding. Prepared ASTM D638 standard specimens and tested on a 50 kN Universal Testing Machine (UTM).',
    'Combined experimental stress-strain data acquisition with optical microscopy to inspect fiber pull-out, matrix cracking, and interfacial adhesion quality.',
    ARRAY['Universal Testing Machine (UTM)', 'Extensometer', 'Optical Microscope', 'OriginLab'],
    ARRAY['Bidirectional Woven Jute Fabric', 'Epoxy Resin LY556', 'Hardener HY951'],
    'Alkali-treated specimens demonstrated a 28.6% increase in tensile strength (reaching 48.2 MPa) and a 34% increase in elastic modulus over untreated composites due to enhanced fiber-matrix mechanical interlocking.',
    'Developed comprehensive understanding of composite laminate theory, ASTM mechanical testing protocols, statistical error propagation, and fractography.',
    'in_progress',
    'RESEARCH & MATERIALS',
    ARRAY['Bio-composites', 'Jute Fiber', 'Tensile Testing', 'Materials Science', 'ASTM'],
    true,
    2
  ),
  (
    'CFD Aerodynamic & Flow Separation Study of Venturi Restriction',
    'venturi-flow-separation-cfd',
    'Compressible and incompressible CFD investigation of pressure drop, boundary layer behavior, and discharge coefficient in Venturi nozzles.',
    'Computational fluid dynamics simulation evaluating wall shear stress distributions, vena contracta phenomena, and recovery cone flow separation angles across diverse Reynolds numbers (10,000 to 500,000).',
    'Differential pressure flow meters suffer from unrecoverable head loss if divergent diffuser angles trigger adverse pressure gradients and severe boundary layer detachment.',
    'Characterize optimal diffuser cone angles (5° to 15°) to maximize kinetic-to-pressure energy conversion efficiency and determine precise discharge coefficient (Cd).',
    'Axisymmetric 2D domain solved using the ANSYS Fluent steady pressure-based coupled solver with SST k-omega turbulence formulation. Inflation layers resolved down to y+ < 1 at the throat wall.',
    'Validated simulation mass flow predictions against analytical Bernoulli and ISO 5167 Venturi discharge formulations.',
    ARRAY['ANSYS Fluent', 'CFD-Post', 'ANSYS Meshing', 'Python'],
    ARRAY['Air (Ideal Gas)', 'Water Liquid (Incompressible)'],
    'Identified 7.5° divergent cone angle as optimal balance, recovering 88.4% of inlet pressure while maintaining attached flow throughout the diffuser. Computed discharge coefficient Cd = 0.982 closely matching standard empirical tables.',
    'Gained deep technical command over near-wall turbulence modeling (y+ criteria), pressure-velocity coupling schemes, and CFD discretization error analysis.',
    'completed',
    'CFD / FLUIDS',
    ARRAY['CFD', 'ANSYS Fluent', 'Fluid Mechanics', 'Turbulence', 'Aerodynamics'],
    true,
    3
  ),
  (
    'AI-Driven CNC Milling Tool Wear & Remaining Useful Life Estimation',
    'ai-cnc-tool-wear-estimation',
    'Machine learning regression and classification pipeline predicting flank wear and remaining useful life (RUL) from spindle vibration telemetry.',
    'Integration of artificial intelligence with subtractive manufacturing: real-time processing of high-frequency accelerometer and acoustic emission sensor signals during end-milling operations to forecast cutting tool flank wear (VB).',
    'Catastrophic cutting tool failure in unattended CNC operations causes workpiece scrapping, spindle spindle bearing damage, and costly production downtime.',
    'Develop a predictive machine learning model capable of estimating tool wear within ±15 µm accuracy before reaching the critical wear criterion (VB = 0.3 mm).',
    'Performed time-domain and frequency-domain (FFT) feature extraction on NASA milling dataset vibration signals. Trained Random Forest and Gradient Boosted Decision Tree models with hyperparameter tuning via cross-validation.',
    'Built automated Python feature-engineering pipeline converting raw multi-channel telemetry into statistical moments (kurtosis, skewness, RMS, crest factor) mapped to physical wear progression.',
    ARRAY['Python', 'Scikit-Learn', 'SciPy Signal', 'Pandas', 'Matplotlib'],
    ARRAY['Carbide End Mills', 'Cast Iron Workpiece Data', 'Tri-axial Accelerometers'],
    'Achieved Mean Absolute Error (MAE) of 11.8 µm on unseen milling cycles and 96.4% classification accuracy in distinguishing sharp, healthy, and worn tool stages.',
    'Solidified the convergence between physical manufacturing dynamics, sensor telemetry processing, and applied machine learning algorithms.',
    'completed',
    'AI × ENGINEERING',
    ARRAY['Machine Learning', 'Predictive Maintenance', 'CNC Machining', 'Signal Processing', 'Python'],
    true,
    4
  );

-- 7. CAD & CAE SIMULATION SHOWCASES
INSERT INTO public.cad_cae (
  title, slug, type, description, boundary_conditions, materials, solver,
  simulation_parameters, mesh_details, results, tools_software, tags, featured, display_order
) VALUES
  (
    'High-Pressure Hydraulic Manifold Block Structural FEA',
    'hydraulic-manifold-fea',
    'fea',
    'High-pressure structural stress and deformation analysis of a multi-port hydraulic valve manifold operating at 350 bar rated pressure.',
    'Fixed support at four mounting bolt locations; internal fluid cavity walls subjected to 35.0 MPa hydrostatic design pressure; 1.5x proof pressure applied to test ports.',
    'Ductile Iron EN-GJS-400-15 (Tensile Yield Strength: 250 MPa, Poisson Ratio: 0.28, Elastic Modulus: 169 GPa)',
    'ANSYS Mechanical APDL / Static Structural Solver',
    '{"solver_type": "Direct Sparse", "large_deflection": false, "load_steps": 1, "proof_pressure_bar": 525}'::jsonb,
    '{"element_type": "SOLID187 (10-Node Quadratic Tetrahedral)", "node_count": 420850, "element_count": 284120, "average_skewness": 0.21, "min_orthogonal_quality": 0.74}'::jsonb,
    'Maximum Von Mises stress concentrated at intersecting internal channel galleries measured 182.4 MPa, yielding a minimum Safety Factor of 1.37 under full 350 bar operating conditions.',
    ARRAY['ANSYS Mechanical', 'SolidWorks CAD'],
    ARRAY['FEA', 'Hydraulics', 'Pressure Vessel', 'Stress Analysis'],
    true,
    0
  ),
  (
    'Centrifugal Pump Impeller Cavitation & Flow CFD',
    'pump-impeller-cavitation-cfd',
    'cfd',
    'Multi-phase cavitation and hydrodynamic flow analysis inside a 5-blade backward-curved centrifugal pump impeller operating at 2900 RPM.',
    'Total pressure inlet at suction flange (101.3 kPa); mass flow outlet boundary condition; Multiple Reference Frame (MRF) rotating domain at 2900 RPM; no-slip roughness walls.',
    'Water Liquid with Schnerr-Sauer Cavitation Model and Water Vapor Phase',
    'ANSYS Fluent Coupled Pressure-Based Solver',
    '{"rpm": 2900, "inlet_pressure_kpa": 101.3, "mass_flow_rate_kg_s": 12.5, "turbulence_model": "SST k-omega"}'::jsonb,
    '{"polyhedral_cells": 1150000, "boundary_layers": 8, "growth_rate": 1.2, "wall_y_plus": "< 1.5"}'::jsonb,
    'Identified blade leading-edge suction peak triggering vapor volume fraction of 0.42 at reduced NPSH conditions. Developed modified blade wrap angle to suppress cavitation inception.',
    ARRAY['ANSYS Fluent', 'CFD-Post', 'CATIA V5'],
    ARRAY['CFD', 'Turbomachinery', 'Cavitation', 'Centrifugal Pump'],
    true,
    1
  );

-- 8. PLC & INDUSTRIAL AUTOMATION SHOWCASE
INSERT INTO public.plc_automation (
  title, slug, description, controller, programming_type,
  inputs, outputs, logic_description, sequence_description,
  hardware, software, simulation_details, results, tags, featured, display_order
) VALUES
  (
    'Four-Station Automated Assembly & Pneumatic Inspection Cell',
    'four-station-assembly-plc',
    'Deterministic PLC control system for an automated index table executing component feeding, pneumatic press insertion, dimensional laser gauging, and pneumatic sortation.',
    'Rockwell Automation Micro820 / Allen-Bradley EtherNet/IP Controller',
    'ladder_logic',
    ARRAY['DI_00: Cycle Start Pushbutton (NO)', 'DI_01: Cycle Stop / E-Stop (NC)', 'DI_02: Table Index Position Prox', 'DI_03: Part Present Optical Sensor', 'DI_04: Press Extend Limit Reed Sw', 'DI_05: Press Retract Limit Reed Sw', 'AI_00: Laser Displacement Sensor (4-20mA)'],
    ARRAY['DO_00: Index Table Motor Contactor', 'DO_01: Feed Hopper Solenoid Valve', 'DO_02: Press Extend Solenoid Valve', 'DO_03: Part Accept Diverter Pneumatic', 'DO_04: Part Reject Bin Air Blast', 'DO_05: System Running Tower Green', 'DO_06: Fault Alarm Red Strobe'],
    'State-machine sequence architecture with step counters (N7:0). Integrated software interlocks preventing table rotation unless press cylinder is fully retracted. High-speed analog threshold comparison for dimensional tolerance (+/- 0.05 mm).',
    '1. Feed Station: Part dispensed onto fixture. 2. Index to Press: Cylinder extends with timed dwell (0.8s) for bushing press fit. 3. Index to Inspection: Laser measurement sampled and compared against lower/upper bounds. 4. Sortation Station: Pneumatic reject gate or accept chute activated. 5. Table index to origin.',
    ARRAY['Micro820 PLC (2080-LC20-20QBB)', 'SMC Pneumatic Double-Acting Cylinders', 'Keyence IL-Series Laser Sensor', '24V DC Power Supply', 'Safety Relay Banner SC26'],
    ARRAY['Rockwell Connected Components Workbench (CCW)', 'FactoryTalk View ME (HMI)'],
    'Simulated full 100-cycle continuous automation sequence in CCW emulator with simulated sensor failure and E-stop latching.',
    'Cycle time optimized to 4.2 seconds per finished assembly with zero state lockups and 100% deterministic fault trapping.',
    ARRAY['PLC', 'Ladder Logic', 'Pneumatics', 'Industrial Automation', 'Rockwell', 'Micro820'],
    true,
    0
  );

-- 9. CERTIFICATIONS
INSERT INTO public.certifications (
  title, issuer, credential_id, date, description, verification_url, display_order
) VALUES
  (
    'Finite Element Analysis Convergence and Mesh Independence',
    'Coursera / Engineering Simulation',
    'FEA-MESH-7721',
    '2025-11-14',
    'Comprehensive mastery of finite element formulation, shape functions, element quality metrics (aspect ratio, skewness, Jacobian), and Richardson extrapolation for mesh independence verification.',
    'https://coursera.org',
    0
  ),
  (
    'Applied Machine Learning & Python for Engineers',
    'Coursera / Engineering Data Institute',
    'ML-ENG-PY-9921',
    '2023-11-20',
    'Practical implementation of statistical learning, supervised regression, vibration classification, and signal feature extraction for physical engineering and sensor telemetry datasets.',
    'https://coursera.org',
    1
  ),
  (
    'Mechanical CAD & Parametric Assembly Certification',
    'Mechanical Design Academy',
    'CAD-MECH-4482',
    '2024-05-18',
    'Advanced top-down parametric part and assembly modeling, geometric dimensioning and tolerancing (GD&T) to ASME Y14.5, and production drafting standards.',
    'https://coursera.org',
    2
  );

-- 10. AI × ENGINEERING SHOWCASE
INSERT INTO public.ai_engineering (
  title, slug, description, application_type, methodology,
  tools_software, results, tags, featured, display_order
) VALUES
  (
    'Deep Surrogate Modeling for Instantaneous Heat Exchanger Thermal Maps',
    'surrogate-thermal-ai',
    'Physics-informed deep neural network acting as a surrogate solver to predict 3D thermal temperature distributions in seconds rather than hours of CFD computation.',
    'surrogate_modeling',
    'Trained a multi-layer perceptron (MLP) on 600 parameterized CFD simulation runs with varying Reynolds numbers, fin counts, and inlet temperatures. Incorporated boundary condition loss penalty terms to enforce thermodynamic energy balance.',
    ARRAY['Python', 'PyTorch', 'ANSYS Fluent', 'NumPy', 'Scikit-Learn'],
    'Reduced thermal evaluation latency from 45 minutes of Navier-Stokes convergence to 12 milliseconds of neural forward inference with an overall RMSE < 2.1°C across the design space.',
    ARRAY['Surrogate Modeling', 'AI Engineering', 'Neural Networks', 'Thermal Analysis', 'CFD Acceleration'],
    true,
    0
  );

-- 11. ARTICLES / TECHNICAL DOSSIERS
INSERT INTO public.articles (
  title, slug, excerpt, content, category, tags, author, reading_time, status, published_at, display_order
) VALUES
  (
    'Grid Convergence Index (GCI): Eliminating Discretization Error in FEA and CFD',
    'grid-convergence-index-engineering',
    'A mathematically rigorous guide to verifying mesh independence using Roache''s Grid Convergence Index and Richardson Extrapolation.',
    'In engineering computational mechanics, claiming simulation accuracy without proving spatial convergence is invalid. The Grid Convergence Index (GCI), developed by P.J. Roache and adopted by ASME and AIAA standards, provides an objective, quantified method to report numerical uncertainty. This dossier demonstrates how to calculate apparent order of convergence p, fractional error, and the 95% confidence band using three consecutively refined mesh resolutions.',
    'COMPUTATIONAL MECHANICS',
    ARRAY['FEA', 'CFD', 'Mesh Independence', 'GCI', 'Numerical Methods'],
    'Adithya G',
    5,
    'published',
    now(),
    0
  ),
  (
    'Design of Deterministic Safety Interlocks in Industrial Ladder Logic',
    'deterministic-safety-interlocks-plc',
    'Architecture and hardware principles for fail-safe pneumatic and electric actuator sequencing in automated manufacturing cells.',
    'Safety in industrial automation cannot rely solely on software timers or software-only checks. This article examines the dual-channel electrical safety architecture, positive-guided safety relays, and fail-safe pneumatic dump valves required to achieve ISO 13849-1 Performance Level d/e compliance in PLC-driven machine designs.',
    'INDUSTRIAL AUTOMATION',
    ARRAY['PLC', 'Safety Systems', 'Ladder Logic', 'Pneumatics', 'ISO 13849'],
    'Adithya G',
    4,
    'published',
    now(),
    1
  );

-- 12. CONNECTIONS
INSERT INTO public.connections (name, url, description, icon, display_order, enabled) VALUES
  ('LinkedIn Profile', 'https://www.linkedin.com/in/adithya-g-mechanical', 'Professional engineering experience, research updates, and verified network.', 'Linkedin', 0, true),
  ('GitHub Engineering Repositories', 'https://github.com/adithya-mechnexus', 'CAD automation scripts, FEA/CFD post-processing Python pipelines, and PLC code.', 'Github', 1, true),
  ('ResearchGate Dossier', 'https://www.researchgate.net', 'Pre-prints, composite material test reports, and computational engineering datasets.', 'BookOpen', 2, true);

-- 13. VISUALIZATION SETTINGS
INSERT INTO public.visualization_settings (
  id, particle_count, particle_speed, geometry_count, color_scheme,
  interaction_intensity, quality, mobile_particle_count, enabled
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  450,
  0.5,
  8,
  'cyan',
  0.6,
  'auto',
  120,
  true
) ON CONFLICT (id) DO NOTHING;
