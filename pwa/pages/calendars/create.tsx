import { NextComponentType, NextPageContext } from "next";
import Head from "next/head";

import { Form } from "../../components/calendar/Form";

const Page: NextComponentType<NextPageContext> = () => (
  <div>
    <div>
      <Head>
        <title>Create Calendar</title>
      </Head>
    </div>
    <Form />
  </div>
);

export default Page;
