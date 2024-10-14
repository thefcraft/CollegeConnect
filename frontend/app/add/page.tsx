"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Edit,
  Trash2,
  ArrowUpDown,
  Menu,
  X,
  LayoutDashboard,
  Database,
  FilePlus,
  Search,
  Upload,
  Save,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { DashboardNav } from "@/components/nav";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast"
import { API_URL } from "@/constants";

type SuggestionOption = "college_name" | "company_name" | "role"

function AddData() {
  const [formData, setFormData] = useState({
    collegeName: "",
    companyName: "",
    role: "",
    ctc: "",
  });
  const { toast } = useToast()
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const suggestionsRef = useRef<HTMLUListElement | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionOption, setSuggestionOption] = useState<SuggestionOption | null>(null)

  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<string[]>([])
  const [colleges, setColleges] = useState<string[]>([])
  const [roles, setRoles] = useState<string[]>([])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const getCompany = async () => {
          const response = await fetch(`${API_URL}/companies`);
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          const result:{
            id: number;
            company_name: string;
            role: string;
            ctc: number;
          }[] = await response.json();
          const companyNames = Array.from(new Set(result.map(company => company.company_name)));
          const roleNames = Array.from(new Set(result.map(company => company.role)));
          
          setCompanies(companyNames);
          setRoles(roleNames);
        }
        const getCollege = async () => {
          const response = await fetch(`${API_URL}/colleges`);
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          const result:{
            id: number;
            college_name: string;
          }[] = await response.json();
          const collegeNames = Array.from(new Set(result.map(college => college.college_name)));
          setColleges(collegeNames);
        }
        await getCompany();
        await getCollege();
      } catch (err ) {
        if (err instanceof Error) {
          alert(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (value && (name === "collegeName" || name === "companyName" || name === "role")) {
      setFilteredSuggestions(
        suggestions.filter((suggestion) =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5)
      );
    } else {
      setFilteredSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if(suggestionOption === "college_name") setFormData({ ...formData, collegeName: suggestion });
    else if(suggestionOption === "company_name") setFormData({ ...formData, companyName: suggestion });
    else if(suggestionOption === "role") setFormData({ ...formData, role: suggestion });
    setFilteredSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prevIndex) => 
        // Math.min(prevIndex + 1, filteredSuggestions.length - 1)
        (prevIndex + 1) % (filteredSuggestions.length || 1)  // Prevent division by zero
      );
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prevIndex) => 
        // Math.max(prevIndex - 1, 0)
        (prevIndex - 1 + filteredSuggestions.length) % (filteredSuggestions.length || 1)  // Prevent negative index
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        handleSuggestionClick(filteredSuggestions[highlightedIndex]);
      }
    }
  };
  const handleClickOutside = (event: MouseEvent) => {
    if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
      setFilteredSuggestions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.collegeName &&
      formData.companyName &&
      formData.role &&
      formData.ctc
    ) {
      try {
        const ctcFloat = parseFloat(formData.ctc);
        if (isNaN(ctcFloat)) {
          throw new Error("Invalid CTC value");
        }
        const newData = {
          college_name: formData.collegeName,
          company_name: formData.companyName,
          role: formData.role,
          ctc: formData.ctc,
        };
        try {
          const response = await fetch(`${API_URL}/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newData),
          });
      
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
      
          const result = await response.json();
          toast({
            title: "Success",
            description: result.message,
          });
        } catch (error) {
          toast({
            title: "Error",
            description: `Failed to add data: ${error}`,
            variant: "destructive",
          });
        }

        console.log("Adding data:", { ...formData, ctc: ctcFloat });
        
        setFormData({ collegeName: "", companyName: "", role: "", ctc: "" });
      } catch (error) {
        toast({
          title: "Error",
          description: "Please enter a valid decimal number for CTC.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Warning",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const collegeNameSelect = () => {
    setSuggestionOption("college_name");
    setSuggestions(colleges);
  }

  const companyNameSelect = () => {
    setSuggestionOption("company_name");
    setSuggestions(companies);
  }

  const roleNameSelect = () => {
    setSuggestionOption("role");
    setSuggestions(roles);
  }

  return (
    <div className="container mx-auto py-10">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add Data</h1>
        <div>
          <Label htmlFor="collegeName">College Name</Label>
          <Input
            id="collegeName"
            name="collegeName"
            value={formData.collegeName}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onSelect={collegeNameSelect}
            placeholder="Enter College Name"
          />
          {filteredSuggestions.length > 0 && suggestionOption === "college_name" && (
            <ul ref={suggestionsRef} className="absolute z-10 mt-1 border border-gray-300 bg-background rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`cursor-pointer p-2 ${highlightedIndex === index ? 'bg-muted' : ''}`}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onSelect={companyNameSelect}
            placeholder="Enter Company Name"
          />
          {filteredSuggestions.length > 0  && suggestionOption === "company_name" && (
            <ul ref={suggestionsRef} className="absolute z-10 mt-1 border border-gray-300 bg-background rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`cursor-pointer p-2 ${highlightedIndex === index ? 'bg-muted' : ''}`}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onSelect={roleNameSelect}
            placeholder="Enter Role"
          />
          {filteredSuggestions.length > 0 && suggestionOption === "role" && (
            <ul ref={suggestionsRef} className="absolute z-10 mt-1 border border-gray-300 bg-background rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`cursor-pointer p-2 ${highlightedIndex === index ? 'bg-muted' : ''}`}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <Label htmlFor="ctc">CTC</Label>
          <Input
            id="ctc"
            name="ctc"
            value={formData.ctc}
            onChange={handleInputChange}
            placeholder="e.g., 50000.00"
            type="number"
          />
        </div>
        <Button type="submit">Add Data</Button>
      </form>
    </div>
  );
}

const navItems = [
  { name: 'Search', href: '/', icon: <Search className="mr-2 h-4 w-4" /> },
  { name: 'Add', href: '/add', icon: <FilePlus className="mr-2 h-4 w-4" /> },
  { name: 'Edit/Delete', href: '/edit', icon: <Edit className="mr-2 h-4 w-4" /> },
  { name: 'View All', href: '/view', icon: <Database className="mr-2 h-4 w-4" /> },
  { name: 'Mass Upload', href: '/upload', icon: <Upload className="mr-2 h-4 w-4" /> },
]

export default function () {
  return (
    <div className="min-h-screen ">
      {/* bg-gray-100 */}
      <DashboardNav navItems={navItems} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AddData />
      </main>
    </div>
  );
}
