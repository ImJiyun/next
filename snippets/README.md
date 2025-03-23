## Working with Database and Server Actions

### Default behavior of form

- When we submit a form. the browser takes all the value of all inputs and makes a request to backend
- the name property of input is appended to the query string

### Server Actions

- Number one way to change data in a next app
- super close integration with HTML forms
- Server actions are functions that will be called with the values a user entered into a form

- **Traditional React App**

  - All JS running in the browser
  - When we need to change data, we make an HTTP request to an outside server
  - Requests are usually done using functions like "fetch" or the "axios" library

- **Next**

  - With Next, some ouf code running in the browser and some is running on the server

  ```tsx
  async function createSnippet(formData: FormData) {
    // This needs to be a server action!
    "use server";

    // Check the user's inputs and make sure they are valid
    // formData.get("") will return the type of FormDataEntryValue (bc it could be a string, file, or blob)
    const title = formData.get("title") as string;
    const code = formData.get("code") as string;

    // Create a new record in the database
    const snippet = await db.snippet.create({
      data: {
        title,
        code,
      },
    });
    console.log(snippet);

    // Redirect the user back to the root route
    redirect("/");
  }
  ```

  - When a user submit a form, a packet of data get send to the server
  - Next receives form data and passes that data to server action
  - We create a new snippet and redirect the user
  - Next sends a response back telling the app to show the home page

### Client vs Server components

- **Server components**

  - By default, all components are server components
  - bends the rules of traditional components a little bit
  - Usually we want to use server components!
  - Better performance + UX
  - Can sue async/await! don't need useState or useEffect to do data fetching
  - have a few limitations
    - Can NOT use any kind of hook
    - Can NOT assign any event handlers

- **Client components**
  - Essentially the same kind of React components we are already used to using
  - Created by adding "use client" at the very top of the file
  - Have all the usuall rulesl of components
  - Can use hooks, event handlers, etc
  - Can NOT directly show a Server Component (there is one exeception)
  - Even though it's a client components, it DOES get rendered one time on the server
- When to use client components?
  - when we need to use hooks
  - when we need to use event handlers

### Fetching data

- Create a server component - a component that doesn't have "use clinet" at the top
- Mark the component as "async"
- Make an HTTP request or directly access a database to get data
- Render data directly, or pass it to a child component

```tsx
import { db } from "@/db";

export default async function Home() {
  const snippets = await db.snippet.findMany();

  const renderedSnippets = snippets.map((snippet) => (
    <div key={snippet.id}>
      <h3>{snippet.title}</h3>
    </div>
  ));

  return <div>{renderedSnippets}</div>;
}
```

### Adding Dynamic Paths

- Wrap the name with square brackets

```tsx
import { db } from "@/db";
import { notFound } from "next/navigation";

interface SnippetShowPageProps {
  params: {
    id: string;
  };
}

export default async function SnippetShowPage(props: SnippetShowPageProps) {
  // props object is automatically passed to this component by Next.js
  // It contains the URL parameters and search parameters

  console.log(props); // { params: { id: '1' }, searchParams: {} }
  // Next treats the URL parameters as strings
  // the id property is a folder name

  const snippet = await db.snippet.findFirst({
    where: {
      id: parseInt(props.params.id),
    },
  });

  if (!snippet) {
    return notFound();
  }

  return <div>{snippet.title}</div>;
}
```

### Special File Name in the 'app' Folder

- `page.tsx` : displays the primary content for the page
- `layout.tsx` : wraps the currently displayed page. use to show content common accross many pages
- `not-found.tsx` : displayed when we call the `notFound` function
  - when we call notFound function, next is going to find the closest not-found.tsx file
- `loading.tsx` : displayed when a server compoent is fetching some data
- `error.tsx` : displayed when an error occurs in a server component
- `route.tsx` : defines API endpoints

```tsx
export default function SnippetNotFound() {
  return (
    <div>
      <h1 className="text-xl bold">
        Sorry, but we couldnt find that particular snippet.
      </h1>
    </div>
  );
}
```

### Showing a Client Component in a Server Component

- Inside `SnippetEditPage` component, we have to fetch data, show it to a user and allow the user to edit the code
- Problem
  - We need to fetch data → Requires `async`/`await` (best handled on the server)
  - The user should be able to edit the code → Requires interactivity (must be a Client Component)
  - However, Client Components do not support `async`/`await` for data fetching
- Data fetching should be done in a Server Component first and then passed down to a Client Component.

```tsx
import SnippetEditForm from "@/components/SnippetEditForm";
import { db } from "@/db";
import { notFound } from "next/navigation";

interface SnippetEditPageProps {
  params: {
    // we receive the id from the URL bc of the file name
    id: string;
  };
}

export default async function SnippetEditPage(props: SnippetEditPageProps) {
  const id = parseInt(props.params.id);
  const snippet = await db.snippet.findFirst({
    where: {
      id,
    },
  });

  if (!snippet) {
    return notFound();
  }

  return (
    <div>
      <SnippetEditForm snippet={snippet} />
    </div>
  );
}
```

```tsx
"use client";

import type { Snippet } from "@prisma/client";

interface SnippetEditFormProps {
  snippet: Snippet;
}

export default function SnippetEditForm({ snippet }: SnippetEditFormProps) {
  return <div>Client component has snippet with title {snippet.title}</div>;
}
```

### Server Actions in Next.js Client Components

- Server actions cannot be defined in Client Components

```tsx
"use client";

import { Editor } from "@monaco-editor/react";
import type { Snippet } from "@prisma/client";
import { useState } from "react";

interface SnippetEditFormProps {
  snippet: Snippet;
}

export default function SnippetEditForm({ snippet }: SnippetEditFormProps) {
  const [code, setCode] = useState(snippet.code);

  const handleEditorChange = (value: string = "") => {
    setCode(value);
  };

  async function updateSnippet() {
    // This needs to be a server action!
    "use server";
  }

  return (
    <div>
      <Editor
        height="40vh"
        theme="vs-dark"
        language="javascript"
        defaultValue={snippet.code}
        options={{ minimap: { enabled: false } }}
        onChange={handleEditorChange}
      />
    </div>
  );
}
```

- Error message : `It is not allowed to define inline "use server" annotated Server Actions in Client Components.`

1. Option 1

   - Define the Server Action in a Server Component and pass it as props to the Client Component
   - Server components can't pass event handlers down to client components - this is the one exception

   - We used "bind" to customized the arguments
   - First argument will be the bound argument
   - Second argument will be "FormData", containing data form (if any exists)
   - form will work even if the user isn't running javascript in the browser

2. Option 2
   - Define the Server ACtion in a separate file and import it into the Client Component
   - We only have to write `use server` once at the top of the file
   - Not tied to a "form", so only the arguments passed directly to the server action are received
   - We can use option 2 for anything besides submitting a form
   - No messing around the "bind" function
   - closer to classic React behavior

`src/actions.index.ts`

```ts
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
```

`src/components/SnippetEditForm.tsx`

```tsx
"use client";

import { Editor } from "@monaco-editor/react";
import type { Snippet } from "@prisma/client";
import { useState } from "react";
import * as actions from "@/actions";

interface SnippetEditFormProps {
  snippet: Snippet;
}

export default function SnippetEditForm({ snippet }: SnippetEditFormProps) {
  const [code, setCode] = useState(snippet.code);

  const handleEditorChange = (value: string = "") => {
    setCode(value);
  };

  const editSnippetAction = actions.editSnippet.bind(null, snippet.id, code);

  return (
    <div>
      <Editor
        height="40vh"
        theme="vs-dark"
        language="javascript"
        defaultValue={snippet.code}
        options={{ minimap: { enabled: false } }}
        onChange={handleEditorChange}
      />
      <form action={editSnippetAction}>
        <button type="submit" className="p-2 border rounded">
          Save
        </button>
      </form>
    </div>
  );
}
```

`app/snippets/page.tsx`

```tsx
import { db } from "@/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as actions from "@/actions";

interface SnippetShowPageProps {
  params: {
    id: string;
  };
}

export default async function SnippetShowPage(props: SnippetShowPageProps) {
  // props object is automatically passed to this component by Next.js
  // It contains the URL parameters and search parameters

  // console.log(props); // { params: { id: '1' }, searchParams: {} }
  // Next treats the URL parameters as strings
  // the id property is a folder name

  const snippet = await db.snippet.findFirst({
    where: {
      id: parseInt(props.params.id),
    },
  });

  if (!snippet) {
    return notFound();
  }

  const deleteSnippetAction = actions.deleteSnippet.bind(null, snippet.id);

  return (
    <div>
      <div className="flex m-4 justify-between items-center">
        <h1 className="text-x1 font-bold">{snippet.title}</h1>
        <div className="flex gap-4">
          <Link
            href={`/snippets/${snippet.id}/edit`}
            className="p-2 border rounded"
          >
            Edit
          </Link>
          <form action={deleteSnippetAction}>
            <button className="p-2 border rounded">Delete</button>
          </form>
        </div>
      </div>
      <pre className="p-3 border rounded bg-gray-200 border-gray-200">
        <code>{snippet.code}</code>
      </pre>
    </div>
  );
}
```
