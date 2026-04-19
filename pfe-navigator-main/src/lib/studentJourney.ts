export type DomainKey = "ai" | "software" | "research" | "communication" | "project";

export type MentorProfile = {
  name: string;
  specialty: string;
  initials: string;
  expertise: DomainKey[];
  availability: "High" | "Medium";
  nextSlot: string;
};

type AcademicStage = {
  id: string;
  label: string;
  year: string;
  status: "completed" | "current" | "upcoming";
  gpa20: number;
  highlights: string[];
  domainScores: Record<DomainKey, number>;
};

type TopicProfile = {
  title: string;
  tags: string[];
  focus: DomainKey[];
};

const stages: AcademicStage[] = [
  {
    id: "y1",
    label: "Year 1",
    year: "Foundation",
    status: "completed",
    gpa20: 12.8,
    highlights: ["Programming basics", "Discrete mathematics"],
    domainScores: { ai: 55, software: 62, research: 48, communication: 58, project: 52 },
  },
  {
    id: "y2",
    label: "Year 2",
    year: "Core engineering",
    status: "completed",
    gpa20: 14.1,
    highlights: ["Data structures", "Database systems"],
    domainScores: { ai: 64, software: 72, research: 57, communication: 64, project: 61 },
  },
  {
    id: "y3",
    label: "Senior year",
    year: "Specialization",
    status: "completed",
    gpa20: 15.3,
    highlights: ["Machine learning", "Cloud systems"],
    domainScores: { ai: 78, software: 81, research: 68, communication: 72, project: 75 },
  },
  {
    id: "pfe",
    label: "PFE phase",
    year: "Execution",
    status: "current",
    gpa20: 16.0,
    highlights: ["Prototype implementation", "Literature review"],
    domainScores: { ai: 84, software: 79, research: 74, communication: 76, project: 82 },
  },
];

const mentors: MentorProfile[] = [
  {
    name: "Dr. Karim Belhaj",
    specialty: "AI Systems and MLOps",
    initials: "KB",
    expertise: ["ai", "software", "project"],
    availability: "High",
    nextSlot: "Tomorrow · 14:00",
  },
  {
    name: "Dr. Salma Idrissi",
    specialty: "Applied Research and Evaluation",
    initials: "SI",
    expertise: ["research", "communication", "project"],
    availability: "Medium",
    nextSlot: "Thu · 10:30",
  },
  {
    name: "Prof. Youssef Ait",
    specialty: "Software Architecture",
    initials: "YA",
    expertise: ["software", "project", "communication"],
    availability: "High",
    nextSlot: "Wed · 16:00",
  },
];

const topicCatalog: TopicProfile[] = [
  {
    title: "Adaptive learning analytics for student success",
    tags: ["AI", "EdTech", "Analytics"],
    focus: ["ai", "research", "project"],
  },
  {
    title: "MLOps pipeline for campus-scale model deployment",
    tags: ["MLOps", "Cloud", "DevOps"],
    focus: ["ai", "software", "project"],
  },
  {
    title: "Academic writing feedback assistant using NLP",
    tags: ["NLP", "Research", "LLM"],
    focus: ["ai", "research", "communication"],
  },
  {
    title: "Supervisor-student collaboration dashboard",
    tags: ["Product", "Web", "Planning"],
    focus: ["software", "communication", "project"],
  },
];

const domainLabels: Record<DomainKey, string> = {
  ai: "AI and Data",
  software: "Software Engineering",
  research: "Research Methodology",
  communication: "Communication",
  project: "Project Leadership",
};

function round(value: number) {
  return Math.round(value);
}

function score20To100(score20: number) {
  return round((score20 / 20) * 100);
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[]) {
  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
}

const domainScores: Record<DomainKey, number> = {
  ai: round(average(stages.map((stage) => stage.domainScores.ai))),
  software: round(average(stages.map((stage) => stage.domainScores.software))),
  research: round(average(stages.map((stage) => stage.domainScores.research))),
  communication: round(average(stages.map((stage) => stage.domainScores.communication))),
  project: round(average(stages.map((stage) => stage.domainScores.project))),
};

const stageScores20 = stages.map((stage) => stage.gpa20);
const academicAverage20 = average(stageScores20);
const academicAverage100 = score20To100(academicAverage20);
const scoreTrend = round((stageScores20[stageScores20.length - 1] - stageScores20[0]) * 5);
const consistencyIndex = Math.max(0, 100 - round(standardDeviation(stageScores20) * 12));
const completedStages = stages.filter((stage) => stage.status === "completed").length;
const overallJourneyProgress = round((completedStages / stages.length) * 100);
const pfeExecutionScore = 74;

const readinessScore = round(
  academicAverage100 * 0.5 +
    Math.max(0, scoreTrend) * 0.15 +
    consistencyIndex * 0.15 +
    pfeExecutionScore * 0.2,
);

const readinessLevel = readinessScore >= 85 ? "Advanced" : readinessScore >= 70 ? "Strong" : "Developing";

const topicSuggestions = topicCatalog
  .map((topic) => {
    const fit = round(average(topic.focus.map((focus) => domainScores[focus])));
    return {
      ...topic,
      fit,
      rationale: `Best aligned with ${topic.focus.map((focus) => domainLabels[focus]).join(" + ")}.`,
    };
  })
  .sort((a, b) => b.fit - a.fit)
  .slice(0, 3);

const mentorRanking = mentors
  .map((mentor) => {
    const expertiseScore = average(mentor.expertise.map((domain) => domainScores[domain]));
    const availabilityBonus = mentor.availability === "High" ? 6 : 2;
    const fit = Math.min(99, round(expertiseScore + availabilityBonus));

    return {
      ...mentor,
      fit,
      reason: `Strong in ${mentor.expertise.map((domain) => domainLabels[domain]).join(", ")}.`,
    };
  })
  .sort((a, b) => b.fit - a.fit);

export const studentJourney = {
  stages,
  completedStages,
  overallJourneyProgress,
  academicAverage20: Number(academicAverage20.toFixed(1)),
  academicAverage100,
  scoreTrend,
  consistencyIndex,
  pfeExecutionScore,
  readinessScore,
  readinessLevel,
  domainScores,
  topicSuggestions,
  mentorRanking,
  assignedMentor: mentorRanking[0],
};

export const getAssignedSupervisor = (): MentorProfile => studentJourney.assignedMentor;

export const getAssignedSupervisorName = (): string => getAssignedSupervisor().name;
