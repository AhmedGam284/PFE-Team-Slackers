import type { DashboardSummaryData } from "../types/dto/dashboard.dto.js";
import type { PfeProjectIdea } from "../types/dto/pfe.dto.js";

export class MockDataService {
  getDashboardSummary(): DashboardSummaryData {
    const completedMilestones = 3;
    const totalMilestones = 8;

    return {
      student: {
        name: "Demo Student",
        specialization: "Software Engineering",
        readinessScore: 72,
      },
      currentPfeRecommendation: {
        title: "AI-Powered Study Planner",
        status: "recommended",
      },
      progress: {
        completedMilestones,
        totalMilestones,
        completionPercentage: Math.round((completedMilestones / totalMilestones) * 100),
      },
      alerts: [
        "Define your problem statement this week",
        "Validate data sources for your solution",
      ],
      upcomingTasks: [
        "Draft proposal outline",
        "List required datasets/APIs",
        "Prepare mentor questions",
      ],
    };
  }

  getSuggestedProjects(): PfeProjectIdea[] {
    return [
      {
        id: "pfe-001",
        title: "PFE Compass: Topic Recommender",
        domain: "EdTech / AI",
        difficulty: "intermediate",
        description:
          "Recommend PFE topics and tracks using a student profile, interests, and skills. Provide clear next steps and milestones.",
        requiredSkills: ["React", "TypeScript", "APIs", "Prompting"],
        matchReason: "Great fit for students exploring AI-assisted guidance tools.",
      },
      {
        id: "pfe-002",
        title: "Smart Internship Matching",
        domain: "Career / Data",
        difficulty: "advanced",
        description:
          "Match students to internships using NLP on CVs and job posts, then explain match reasoning and skill gaps.",
        requiredSkills: ["NLP", "Data preprocessing", "APIs"],
        matchReason: "Strong industry relevance and measurable outcomes.",
      },
      {
        id: "pfe-003",
        title: "Project Management Coach",
        domain: "Productivity",
        difficulty: "beginner",
        description:
          "A simple milestone tracker with weekly check-ins and mentor-style feedback.",
        requiredSkills: ["CRUD concepts", "UX", "Communication"],
        matchReason: "Perfect MVP scope with clear deliverables.",
      },
    ];
  }
}
