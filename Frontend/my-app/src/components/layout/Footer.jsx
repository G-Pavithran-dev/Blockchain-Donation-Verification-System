export function Footer() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <div className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          <p>© 2026 CivicTrust. Transparent giving. Verified NGOs.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">About</a>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
