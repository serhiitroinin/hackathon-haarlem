# Social-Work Process Sources — training-builder input library

> Curated, real-world social-work **process documentation** to feed the Maverx AI training-builder
> as realistic source material. Each entry is a *phased process* that maps onto the didactic arc
> (Kick-off → Theory → Example → Exercise → Wrap-up).

## Why these fit the training-builder
A social-work *methodiek* is already a structured, phased procedure. Each phase → a Theory slide
+ an Exercise slide; the "reflective question" speaker-note field is literally how these methods
are taught. Grounding generation in these docs (vs. model memory) avoids hallucination — e.g. the
fast summarizer wrongly claimed "Krachtwerk = intellectual disabilities"; it is the Strengths Model
for socially-excluded / vulnerable people.

## Primary source: Movisie (NL) — Databank Effectieve sociale interventies
Dutch national knowledge institute. Standardized template per method (doelgroep, doel, werkwijze,
fasen, onderbouwing) → write one parser/prompt, feed many methods.

| Method | Process (from the actual PDF) | Notes |
|---|---|---|
| **Oplossingsgericht werken** (Solution-Focused) | 1) Perceptieonderzoek → 2) Doelformulering (*wondervraag*) → 3) Uitzonderingen & hulpbronnen (*schaalvraag*) → 4) Volgende stap | ⭐ Cleanest 1:1 with didactic arc |
| **Krachtwerk** (Strengths Model) | Opbouw (engagement + krachteninventarisatie) → Uitvoering (herstelplan) → Evaluatie; tool: teamkrachtbespreking | Has worksheets/tools |
| **Signs of Safety** | Harm/danger map → scaling → network meetings (family group conference) | Safeguarding/child protection |
| **Betere besluiten in het sociaal werk** | Decision-making models for casework | Ethics/judgment module |

PDFs:
- Oplossingsgericht werken: https://www.movisie.nl/sites/default/files/2018-03/Methodebeschrijving-oplossingsgericht-werken-in-sociaal-werk.pdf
- Krachtwerk: https://www.movisie.nl/sites/default/files/2021-08/Interventiebeschrijving-Krachtwerk.pdf
- Signs of Safety: https://www.movisie.nl/sites/default/files/2019-12/methodebeschrijving-signs-of-safety.pdf
- Betere besluiten 2.0: https://www.movisie.nl/sites/default/files/2022-06/Betere-besluiten-in-het-sociaal-werk-2.0.pdf
- Verkenning methoden AMW (survey/index): https://www.movisie.nl/sites/movisie.nl/files/publication-attachment/Verkenning_methoden_AMW%20%5BMOV-716365-00%5D.pdf
- Hub — basismethodieken: https://www.movisie.nl/artikel/methodische-professionaliteit-wat-zijn-basismethodieken

## International standards (English)
- NASW Standards for Social Work Case Management — 12 standards (Assessment; Service Planning,
  Implementation & Monitoring; Practice Evaluation; Record Keeping; ...):
  https://www.socialworkers.org/LinkClick.aspx?fileticket=acrzqmEfhlo%3D&portalid=0
- Case Management Practical Guide (Social Service Workforce Alliance):
  https://socialserviceworkforce.org/wp-content/uploads/2024/03/Case_Management_Practical_Guide.pdf
- Social Work Portal — 7-stage casework process + templates:
  https://www.socialworkportal.com/social-casework/ · https://www.socialworkportal.com/social-work-intake-forms/

## Generic casework process (lowest-common-denominator for demo intake)
Intake → Study → Assessment/Diagnosis → Intervention/Treatment → Evaluation → Termination → Follow-up.

## Suggested demo training (1 deck, ready to generate)
**"Oplossingsgericht werken — basics for new social workers"**, ~20 slides:
Kick-off (why solution-focused) → Theory ×4 (the four core activities) → Example (worked dialogue:
wondervraag + schaalvraag) → Exercise (role-play a scaling question) → Wrap-up. Clean source,
clean arc, low hallucination risk.
