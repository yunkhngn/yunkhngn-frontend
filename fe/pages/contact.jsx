import Layout from "@/components/template/Default/Layout";

export default function contact() {
    return (
        <div className="flex flex-col items-center justify-center p-8 sm:p-20 min-h-[50vh]">
            <h1 className="text-4xl font-bold mb-4">Contact</h1>
            <p className="text-muted-foreground">Get in touch with me.</p>
        </div>
    );
}

contact.getLayout = function getLayout(page) {
    return (
        <Layout
            title="Contact"
            description="Contact"
        >
            {page}
        </Layout>
    );
};
