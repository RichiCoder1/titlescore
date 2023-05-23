class HTMLTagRewriter {
  element(element: Element) {
    const classAttr = element.getAttribute("class");
    if (classAttr == null) {
      element.setAttribute("class", "dark");
    } else if (!classAttr.includes("dark")) {
      element.setAttribute("class", `${classAttr} dark`);
    }
  }
}

export const onRequest: PagesFunction<CfEnv> = async (context) => {
  const response = await context.next();
  if (response.headers.get("content-type")?.includes("text/html")) {
    if (context.request.headers.get("Cookie")?.includes("ts__colorMode=dark")) {
      const rewriter = new HTMLRewriter();
      rewriter.on("html", new HTMLTagRewriter());
      return rewriter.transform(response);
    }
  }
  return response;
}
