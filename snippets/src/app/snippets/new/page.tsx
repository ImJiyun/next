"use client";

import React from "react";
import { useFormState } from "react-dom";
import * as actions from "@/actions";

export default function SnippetCreatePage() {
  // in useFormState hook, first arg is server action, second arg is initial form state
  const [formState, action] = useFormState(actions.createSnippet, {
    message: "",
  });
  // formState is an object that is going to be updated and changed over tiem and communicated with the server action
  // when SnippetCreatePage is rendered, formState is being there too
  // when the user submits the form, the formState is going to be sent to the server action
  // the server action is going to be able to read the formState and do something with it

  // action : an updated version of server action
  // we're going to take that action and pass it to the form instead of original server action
  return (
    <form action={action}>
      <h3 className="font-bold m-3">Create a Snippet</h3>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <label htmlFor="title" className="w-12">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            className="border rounded p-2 w-full"
          />
        </div>
        <div className="flex gap-4">
          <label htmlFor="code" className="w-12">
            Code
          </label>
          <textarea
            name="code"
            id="code"
            className="border rounded p-2 w-full"
          />
        </div>

        {formState.message && (
          <div className="my-2 p-2 bg-red-200 border rounded border-red-400">
            {formState.message}
          </div>
        )}

        <button type="submit" className="rounded p-2 bg-blue-200">
          Create
        </button>
      </div>
    </form>
  );
}
