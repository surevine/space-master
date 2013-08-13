#!/bin/sh

awk -F'|' '{
  n = split($3, t, ",")
  m = split($4, v, ",")
  for (i = 0; ++i <= n;)
      if (m == 0) {
        print $1"\|"$2"\|"t[i]
      }  
      else {
        for (j = 0; ++j <=m;)
            print $1"\|"$2"\|"t[i]"\|"v[j]
      } 
  }' ./user_spec.txt  >> newfile.txt

