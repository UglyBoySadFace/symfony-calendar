import { NextComponentType, NextPageContext } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import { useQuery } from "react-query";

import Pagination from "../common/Pagination";
import { List } from "./List";
import { PagedCollection } from "../../types/collection";
import { User } from "../../types/User";
import { fetch, FetchResponse, parsePage } from "../../utils/dataAccess";
import { useMercure } from "../../utils/mercure";

export const getUsersPath = (page?: string | string[] | undefined) =>
  `/users${typeof page === "string" ? `?page=${page}` : ""}`;
export const getUsers = (page?: string | string[] | undefined) => async () =>
  await fetch<PagedCollection<User>>(getUsersPath(page));
const getPagePath = (path: string) => `/users/page/${parsePage("users", path)}`;

export const PageList: NextComponentType<NextPageContext> = () => {
  const {
    query: { page },
  } = useRouter();
  const { data: { data: users, hubURL } = { hubURL: null } } = useQuery<
    FetchResponse<PagedCollection<User>> | undefined
  >(getUsersPath(page), getUsers(page));
  const collection = useMercure(users, hubURL);

  if (!collection || !collection["hydra:member"]) return null;

  return (
    <div>
      <div>
        <Head>
          <title>User List</title>
        </Head>
      </div>
      <List users={collection["hydra:member"]} />
      <Pagination collection={collection} getPagePath={getPagePath} />
    </div>
  );
};
