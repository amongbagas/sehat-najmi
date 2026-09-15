CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudentProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nis" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CounselorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CounselorProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MoodEntry" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "moodValue" INTEGER NOT NULL,
    "note" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MoodEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "prompt" TEXT,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CbtSession" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "duration" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CbtSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "score" INTEGER,
    "duration" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MissionProgress" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MissionProgress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GratitudeEntry" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GratitudeEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AiConversation" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AiConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssessmentResult" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AssessmentResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UsabilitySurvey" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "usabilityScore" DOUBLE PRECISION NOT NULL,
    "satisfaction" DOUBLE PRECISION NOT NULL,
    "featureRating" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsabilitySurvey_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrisisAlert" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CrisisAlert_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ForumTopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumTopic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ForumPost" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumPost_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "StudentProfile_userId_key" ON "StudentProfile"("userId");
CREATE UNIQUE INDEX "StudentProfile_nis_key" ON "StudentProfile"("nis");
CREATE UNIQUE INDEX "StudentProfile_participantId_key" ON "StudentProfile"("participantId");
CREATE UNIQUE INDEX "CounselorProfile_userId_key" ON "CounselorProfile"("userId");
CREATE UNIQUE INDEX "CounselorProfile_nip_key" ON "CounselorProfile"("nip");

ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CounselorProfile" ADD CONSTRAINT "CounselorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MoodEntry" ADD CONSTRAINT "MoodEntry_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudentProfile"("participantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudentProfile"("participantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CbtSession" ADD CONSTRAINT "CbtSession_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudentProfile"("participantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudentProfile"("participantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MissionProgress" ADD CONSTRAINT "MissionProgress_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudentProfile"("participantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GratitudeEntry" ADD CONSTRAINT "GratitudeEntry_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudentProfile"("participantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiConversation" ADD CONSTRAINT "AiConversation_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudentProfile"("participantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssessmentResult" ADD CONSTRAINT "AssessmentResult_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudentProfile"("participantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UsabilitySurvey" ADD CONSTRAINT "UsabilitySurvey_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudentProfile"("participantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrisisAlert" ADD CONSTRAINT "CrisisAlert_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "StudentProfile"("participantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumTopic" ADD CONSTRAINT "ForumTopic_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "ForumTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Supabase exposes the public schema through its Data API. This application
-- accesses data only through authenticated Next.js route handlers, so deny
-- direct Data API access by enabling RLS without public policies.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "StudentProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CounselorProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MoodEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "JournalEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CbtSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GameSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "MissionProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GratitudeEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AiConversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AssessmentResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UsabilitySurvey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CrisisAlert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ForumTopic" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ForumPost" ENABLE ROW LEVEL SECURITY;
