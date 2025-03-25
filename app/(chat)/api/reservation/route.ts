import { auth } from "@/app/(auth)/auth";
import { getStudySessionById, updateStudySession } from "@/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Study session ID not provided!", { status: 400 });
  }

  const session = await auth();
  if (!session || !session.user) {
    return new Response("Unauthorized access!", { status: 401 });
  }

  try {
    const studySession = await getStudySessionById({ id });

    if (!studySession) {
      return new Response("Study session not found!", { status: 404 });
    }

    if (studySession.userId !== session.user.id) {
      return new Response("Unauthorized access to this study session!", { status: 403 });
    }

    return new Response(JSON.stringify(studySession), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error fetching study session:", error);
    return new Response("Internal server error!", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Study session ID not provided!", { status: 400 });
  }

  const session = await auth();
  if (!session || !session.user) {
    return new Response("Unauthorized access!", { status: 401 });
  }

  try {
    const studySession = await getStudySessionById({ id });

    if (!studySession) {
      return new Response("Study session not found!", { status: 404 });
    }

    if (studySession.userId !== session.user.id) {
      return new Response("Unauthorized access to this study session!", { status: 403 });
    }

    if (studySession.isCompleted) {
      return new Response("Study session has already been marked as completed!", { status: 409 });
    }

    const body = await request.json();

    if (!body.magicWord) {
      return new Response("Magic word is required!", { status: 400 });
    }

    if (body.magicWord.toLowerCase() !== "futured") {
      return new Response("Incorrect magic word!", { status: 403 });
    }

    const updatedStudySession = await updateStudySession({
      id,
      isCompleted: true,
    });

    return new Response(JSON.stringify(updatedStudySession), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error updating study session:", error);
    return new Response("Internal server error!", { status: 500 });
  }
}
