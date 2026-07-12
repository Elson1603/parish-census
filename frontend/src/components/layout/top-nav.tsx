import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Moon, Search, Sun } from "lucide-react";
import { getGlobalSearchSuggestions } from "@/services/census.service";
import { useThemeMode } from "@/context/theme-context";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

export function TopNav() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeMode();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { data = [], isFetching } = useQuery({
    queryKey: ["global-search", query],
    queryFn: () => getGlobalSearchSuggestions(query),
    enabled: query.trim().length > 1,
  });

  const grouped = useMemo(
    () => ({
      family: data.filter((item) => item.type === "Family"),
      member: data.filter((item) => item.type === "Member"),
      village: data.filter((item) => item.type === "Village"),
    }),
    [data],
  );

  const openSuggestion = (type: string, id: string) => {
    setSearchOpen(false);
    setQuery("");

    if (type === "Family") {
      void navigate({ to: "/population/families/$familyId", params: { familyId: id } });
      return;
    }

    if (type === "Member") {
      void navigate({ to: "/population/members" });
      return;
    }

    void navigate({ to: "/population/villages/$villageId", params: { villageId: id } });
  };

  return (
    <>
      <header className="sticky top-0 z-10 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card/85 px-4 py-3 shadow-sm backdrop-blur-md sm:px-6 lg:px-8">
        <SidebarTrigger className="shrink-0" />

        <Button
          type="button"
          variant="outline"
          className="h-9 w-full min-w-0 max-w-md justify-start gap-2 overflow-hidden rounded-full bg-background/70 text-muted-foreground shadow-none hover:bg-muted/70 hover:text-foreground"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="size-4 shrink-0" />
          <span className="truncate text-sm">Search villages, families, members...</span>
          <kbd className="ml-auto hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            Ctrl K
          </kbd>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 rounded-full bg-background/70"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </header>

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput value={query} onValueChange={setQuery} placeholder="Search village, family, member..." />
        <CommandList>
          {!isFetching && query.trim().length > 1 ? <CommandEmpty>No matches found.</CommandEmpty> : null}

          {grouped.village.length > 0 ? (
            <CommandGroup heading="Villages">
              {grouped.village.map((item) => (
                <CommandItem key={item.id} onSelect={() => openSuggestion(item.type, item.id)}>
                  <span className="truncate">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {grouped.family.length > 0 ? (
            <CommandGroup heading="Families">
              {grouped.family.map((item) => (
                <CommandItem key={item.id} onSelect={() => openSuggestion(item.type, item.id)}>
                  <span className="truncate">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {grouped.member.length > 0 ? (
            <CommandGroup heading="Members">
              {grouped.member.map((item) => (
                <CommandItem key={item.id} onSelect={() => openSuggestion(item.type, item.id)}>
                  <span className="truncate">{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}
