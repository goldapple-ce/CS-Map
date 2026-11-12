import bash from "highlight.js/lib/languages/bash"
import css from "highlight.js/lib/languages/css"
import http from "highlight.js/lib/languages/http"
import java from "highlight.js/lib/languages/java"
import javascript from "highlight.js/lib/languages/javascript"
import json from "highlight.js/lib/languages/json"
import kotlin from "highlight.js/lib/languages/kotlin"
import python from "highlight.js/lib/languages/python"
import sql from "highlight.js/lib/languages/sql"
import typescript from "highlight.js/lib/languages/typescript"
import xml from "highlight.js/lib/languages/xml"
import yaml from "highlight.js/lib/languages/yaml"
import rehypeHighlight from "rehype-highlight"
import type { Options as ReactMarkdownOptions } from "react-markdown"

/** 언어가 명시된 fenced code block만 예측 가능한 문법 규칙으로 강조한다. */
export const syntaxHighlightPlugins: NonNullable<
  ReactMarkdownOptions["rehypePlugins"]
> = [
  [
    rehypeHighlight,
    {
      detect: false,
      languages: {
        bash,
        css,
        http,
        java,
        javascript,
        json,
        kotlin,
        python,
        sql,
        typescript,
        xml,
        yaml,
      },
      aliases: {
        bash: ["sh", "shell"],
        javascript: ["js", "jsx"],
        typescript: ["ts", "tsx"],
        xml: ["html"],
        yaml: ["yml"],
      },
      plainText: ["text", "plaintext", "txt"],
    },
  ],
]
