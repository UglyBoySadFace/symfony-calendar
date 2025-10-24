import {
  GetStaticPaths,
  GetStaticProps,
  NextComponentType,
  NextPageContext,
} from "next";
import DefaultErrorPage from "next/error";
import Head from "next/head";
import { useRouter } from "next/router";
import { dehydrate, QueryClient, useQuery } from "react-query";

import { Form } from "../../../components/user/Form";
import { PagedCollection } from "../../../types/collection";
import { User } from "../../../types/User";
import { fetch, FetchResponse, getItemPaths } from "../../../utils/dataAccess";

const getUser = async (id: string | string[] | undefined) =>
  id ? await fetch<User>(`/users/${id}`) : Promise.resolve(undefined);

const Page: NextComponentType<NextPageContext> = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: { data: user } = {} } = useQuery<
    FetchResponse<User> | undefined
  >(["user", id], () => getUser(id));

  if (!user) {
    return <DefaultErrorPage statusCode={404} />;
  }

  return (
    <div>
      <div>
        <Head>
          <title>{user && `Edit User ${user["@id"]}`}</title>
        </Head>
      </div>
      <Form user={user} />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({
  params: { id } = {},
}) => {
  if (!id) throw new Error("id not in query param");
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(["user", id], () => getUser(id));

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const response = await fetch<PagedCollection<User>>("/users");
  const paths = await getItemPaths(response, "users", "/users/[id]/edit");

  return {
    paths,
    fallback: true,
  };
};

export default Page;
