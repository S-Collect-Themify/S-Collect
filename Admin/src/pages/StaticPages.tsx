import {
  StaticPagesHeader,
  StaticPagesTabs,
  ContactUsForm,
  FaqManager,
  LegalPageForm,
  useStaticPagesStore,
} from '../features/staticPages';

const StaticPages = () => {
  const activeTab = useStaticPagesStore((s) => s.activeTab);

  return (
    <>
      <div className="sidebar-page-container-header">
        <StaticPagesHeader />
      </div>

      <div className="flex-1 overflow-y-auto pt-2 pb-6 sidebar-page-container transition-all">
        <StaticPagesTabs />

        {activeTab === 'contact' && <ContactUsForm />}
        {activeTab === 'faq' && <FaqManager />}
        {activeTab === 'return' && <LegalPageForm type="return" />}
        {activeTab === 'terms' && <LegalPageForm type="terms" />}
        {activeTab === 'privacy' && <LegalPageForm type="privacy" />}
      </div>
    </>
  );
};

export default StaticPages;
