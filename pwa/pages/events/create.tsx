import { NextComponentType, NextPageContext } from "next";
import Head from "next/head";

import { Form } from "../../components/event/Form";

const Page: NextComponentType<NextPageContext> = () => (
  <div>
    <div>
      <Head>
        <title>Create Event</title>
      </Head>
    </div>
    <Form />
  </div>
);

export default Page;
