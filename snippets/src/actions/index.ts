"use server";
import { db } from "@/db";
import { redirect } from "next/navigation";

export async function editSnippet(id: number, code: string) {
  await db.snippet.update({
    where: { id },
    data: { code },
  });

  redirect(`/snippets/${id}`);
}

export async function deleteSnippet(id: number) {
  await db.snippet.delete({ where: { id } });

  redirect("/");
}

// formState will always be the first argument
export async function createSnippet(
  formState: { message: string },
  formData: FormData
) {
  try {
    // Check the user's inputs and make sure they are valid
    // formData.get("") will return the type of FormDataEntryValue (bc it could be a string, file, or blob)
    const title = formData.get("title");
    const code = formData.get("code");

    // Check if the title and code are valid
    // if they are not valid, we're going to return updated formState object, causing compoennt to rerender
    if (typeof title !== "string" || title.length < 3) {
      return {
        message: "Title must be longer",
      };
    }

    if (typeof code !== "string" || code.length < 10) {
      return {
        message: "Code must be longer",
      };
    }

    // Create a new record in the database
    await db.snippet.create({
      data: {
        title,
        code,
      },
    });
  } catch (error: unknown) {
    // If there is an error, we will catch it here

    // We will update the formState object with an error message
    if (error instanceof Error) {
      return { message: error.message };
    } else {
      return {
        message: "Something went wrong",
      };
    }
  }

  // Redirect the user back to the root route
  redirect("/");
  // we shouldn't put redirect into try / catch block
}
