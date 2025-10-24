import { GetStaticPaths, GetStaticProps } from "next";
import { dehydrate, QueryClient } from "react-query";

import {
  PageList,
  getUsers,
  getUsersPath,
} from "../../../components/user/PageList";
import { PagedCollection } from "../../../types/collection";
import { User } from "../../../types/User";
import { fetch, getCollectionPaths } from "../../../utils/dataAccess";

export const getStaticProps: GetStaticProps = async ({
  params: { page } = {},
}) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(getUsersPath(page), getUsers(page));

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 1,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const response = await fetch<PagedCollection<User>>("/users");
  const paths = await getCollectionPaths(
    response,
    "users",
    "/users/page/[page]"
  );

  return {
    paths,
    fallback: true,
  };
};

export default PageList;
