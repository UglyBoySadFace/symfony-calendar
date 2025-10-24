import { NextComponentType, NextPageContext } from "next";
import Head from "next/head";

import { Form } from "../../components/user/Form";

const Page: NextComponentType<NextPageContext> = () => (
  <div>
    <div>
      <Head>
        <title>Create User</title>
      </Head>
    </div>
    <Form />
  </div>
);

export default Page;
