// Fixed syntax - removed problematic <b style> inside nodes which sometimes break the parser 
// and fixed the missing space in <hr />. Also fixed the arrow formatting.
const mermaidCode = \`graph TD
    classDef titleStyle fill:#FFD700,stroke:#B8860B,stroke-width:3px
    classDef blueBox fill:#1565C0,stroke:#0D47A1,stroke-width:2px,color:#fff
    classDef dbBox fill:#263238,stroke:#455A64,stroke-width:3px,color:#fff
    classDef lightYellowBox fill:#FFFDE7,stroke:#FBC02D,stroke-width:2px,color:#000
    classDef loginBoxTeacher fill:#E3F2FD,stroke:#90CAF9,stroke-width:2px,color:#000
    classDef loginBoxParent fill:#FFFDE0,stroke:#FFCC80,stroke-width:2px,color:#000
    classDef darkBlueBox fill:#0D47A1,stroke:#000,stroke-width:2px,color:#fff

    Title([SMART SCHOOL PARENT PORTAL]):::titleStyle

    subgraph Center_System [ ]
        style Center_System fill:none, stroke:none
        DU[DATA UPDATE]:::blueBox
        DB[(SCHOOL DATABASE)]:::dbBox
    end

    subgraph Teacher_Side [ ]
        style Teacher_Side fill:none, stroke:none
        TLog[TEACHER LOGIN<br/>ID: ********<br/>PASSWORD<br/>Login]:::loginBoxTeacher
        TPanel[TEACHER PANEL<br/>Add Marks<br/>Homework<br/>Exam Timetable<br/>Result Upload]:::lightYellowBox
        TPerf[Student Performance<br/>Weak: Red / Good: Green<br/>----------<br/>Maths: Weak<br/>Science: Good<br/>English: Average]:::lightYellowBox
    end

    subgraph Parent_Side [ ]
        style Parent_Side fill:none, stroke:none
        PLog[PARENT LOGIN<br/>Student ID<br/>********<br/>Login]:::loginBoxParent
        PAccess[LIVE ACCESS TO PARENTS<br/>Marks<br/>Homework<br/>Exam Timetable<br/>Result]:::lightYellowBox
        PPerf[Student Performance<br/>----------<br/>Maths: Weak<br/>Science: Good<br/>English: Average]:::lightYellowBox
    end

    subgraph Notifications [ ]
        style Notifications fill:none, stroke:none
        SMS[SMS Alerts<br/><br/>Homework Added!]:::lightYellowBox
        WA[WhatsApp Notify<br/><br/>Marks: 85, Maths: Weak]:::lightYellowBox
    end

    BottomTrack[STUDENT PERFORMANCE TRACKING<br/>Weak: Red | Good: Green]:::darkBlueBox

    Title ~~~ DU
    DU --> DB
    TLog -->|Input| DB
    DB -->|Fetch| PLog
    PLog -->|Login Req| DB
    TPanel <==>|Data Flow| DB
    DB <==>|Data Flow| PAccess
    DB -->|Trigger| SMS
    DB -->|Trigger| WA
    TPerf -.->|Notify| SMS
    TPerf -.->|Notify| WA\`;

const state = {
  code: mermaidCode,
  mermaid: { theme: 'default' },
  autoSync: true,
  updateDiagram: true
};

const jsonState = JSON.stringify(state);
const encodedState = Buffer.from(jsonState).toString('base64');
console.log("https://mermaid.ink/img/" + encodedState);
