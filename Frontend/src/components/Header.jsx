import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SidebarTrigger } from './ui/sidebar';

export function Header() {
  return (
    <header className="h-16 px-6 flex items-center justify-between border-b bg-white">
      <SidebarTrigger />
      <div className="flex items-center gap-2">
        <h1 className="font-semibold text-xl">Welcome to Classroom</h1>
      </div>
      <div className="flex items-center gap-4">
      <Avatar className="h-8 w-8">
          <AvatarFallback>{"VN"}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}