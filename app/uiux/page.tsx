import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

export default async function UIUXPage() {
  return (
    <>
      <h1 className="text-3xl">UI/UXデザインについての考察</h1>
      <p>この授業課題について、UI/UXの観点から分析しました。</p>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Webサイトの概要</AccordionTrigger>
          <AccordionContent>
            このWebサイトは、家庭向けの在庫管理アプリです。
            <br />
            使いやすさを重視して、シンプルなデザインにすることを心がけています。
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>デザインでのこだわり</AccordionTrigger>
          <AccordionContent>
            shadcn/uiのコンポーネントライブラリを使用し、現代のディファクトスタンダードに沿ったデザインになっています。
            <br />
            スマートフォンやタブレットで使うことも想定し、レスポンシブに対応しました。
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>良いポイント</AccordionTrigger>
          <AccordionContent>
            画面左側にサイドバーがあり、各ページにジャンプできます。
            <br />
            ユーザーが迷わずに使えるように、シンプルな操作性を心がけました。
            <br />
            またダークテーマをサポートし、ユーザーの好みに合わせた設定が可能です。
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-4">
          <AccordionTrigger>改善点</AccordionTrigger>
          <AccordionContent>
            全体的な構成が（それなりに）分かりづらい上に、それらについての説明が不足している状況です。
            <br />
            また、現在はDiscord/GitHubでのログインに限定しているため、Googleアカウントなど他のサービスでのログインができない点も改善の余地があります。
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <p className="my-4">
        以上が私のWeb基礎の進級発表制作物のUI/UX分析です。次は、
        <Link
          href="https://react-next-portfolio-ashy.vercel.app"
          className="text-blue-500 underline"
        >
          青山くんのページ
        </Link>
        をどうぞ。
      </p>
    </>
  );
}
